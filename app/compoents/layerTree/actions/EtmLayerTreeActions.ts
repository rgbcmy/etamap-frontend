import Map from 'ol/Map';
import { getLayerById, setLayerAndChildrenVisible, getParentCollection } from '../../../common/openlayers/layer'
//import type { TreeDataNode } from 'antd';
import LayerGroup from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import type BaseLayer from 'ol/layer/Base';
import type { Collection } from 'ol';
export interface MoveLayerParams {
    dragKey: string;
    dropKey: string;
    dropToGap: boolean;
    dropPosition: number;//-1 | 0 | 1; // -1为上方，0为内部，1为下方(tree视觉上的，非ol内部)
}
export class EtmLayerTreeActions {
    private map: Map;
    //存储到map里了，不再重复存储
    // private _currentLayerId: string | null = null;
    // private _selectedLayerIds: string[] = [];

    constructor(map: Map) {
        this.map = map;
    }
    // ====== 添加组 ======
    addGroup(name?: string) {
        debugger
        const selectedIds = this.getSelectedLayerIds();

        // 情况 1：选中多个图层或单个图层(并且不是图层组) → groupSelected
        if (selectedIds.length > 1 || (selectedIds.length === 1 && getLayerById(this.map, selectedIds[0]) instanceof Layer)) {
            
            const newGroup = new LayerGroup();
            newGroup.setProperties({ id: crypto.randomUUID(), name: name || this.generateUniqueGroupName() });

            selectedIds.forEach((id) => {
                const layer = getLayerById(this.map, id);
                if (layer) {
                    this.removeLayerOrGroup(id);
                    newGroup.getLayers().push(layer);
                }
            });
            this.map.getLayers().push(newGroup);
            return { newGroupId: newGroup.get('id'), parentGroupId: null };
        } else {
            // 情况 2：未选择图层 单独新建空组 → 直接在顶层创建，或者只有一个图层，并且他是图层组
            // 获取父集合
            let newGroup = new LayerGroup();
            let parentGroupId = null;
            newGroup.setProperties({ id: crypto.randomUUID(), name: name || this.generateUniqueGroupName() });
            let parentGroup: Collection<BaseLayer>;
            if (selectedIds.length === 1 && (getLayerById(this.map, selectedIds[0]) instanceof LayerGroup)) {
                let layer = getLayerById(this.map, selectedIds[0]) as LayerGroup

                parentGroup = layer.getLayers();//getParentCollection(this.map, layer) as any;
                parentGroupId = layer.get('id');
            } else {
                parentGroup = this.map.getLayers();

            }
            parentGroup.push(newGroup);
            return { newGroupId: newGroup.get('id'), parentGroupId: parentGroupId };
        }

    }
    private generateUniqueGroupName(): string {
        const layers = this.map.getLayers().getArray();
        let idx = 1;
        let name = `group${idx}`;
        const existingNames = new Set(layers.map((l) => l.get('name')));
        while (existingNames.has(name)) {
            idx++;
            name = `group${idx}`;
        }
        return name;
    }
    // ====== 选中管理 ======
    getCurrentLayerId(): string {
        return this.map.get('currentLayerId');// this._currentLayerId;
    }

    setCurrentLayerId(id: string) {
        let selectedLayerIds = this.map.get('selectedLayerIds') ?? []
        if (!selectedLayerIds.includes(id)) {
            selectedLayerIds.push(id);
        }
        this.map.set('selectedLayerIds', selectedLayerIds)
        this.map.set('currentLayerId', id)
    }

    getSelectedLayerIds(): string[] {
        return this.map.get('selectedLayerIds') ?? []//this._selectedLayerIds;
    }

    setSelectedLayerIds(ids: string[]) {
        this.map.set('selectedLayerIds', ids);
        //todo后期确认是否将最后一个选中的当作当前图层
        this.map.set('currentLayerId', ids.length > 0 ? ids[ids.length - 1] : null);
    }
    toggleLayerVisibility(layerId: string, checked: boolean, linkParentChild: boolean) {
        if (!this.map) {
            return
        }
        let layer = getLayerById(this.map, layerId);
        if (!layer) {
            console.warn(`can't found the layer`);
            return
        }
        //设置图层相关可见
        
        if (!linkParentChild) {
            // 方案 A：不做父子联动
            layer.setVisible(checked);
        } else {
            // 方案 B：父子联动
            if (layer instanceof LayerGroup) {
                setLayerAndChildrenVisible(layer, checked)

            } else {
                setLayerAndChildrenVisible(layer, checked)
                // 可选：更新父组 visible,暂时不需要
                // 如果需要，可以递归检查父节点，保持父组 visible=true 只要有子节点可见
            }
        }

    }

    /**
     * 移动拖拽图层（仅依赖 OpenLayers，不依赖 Antd Tree）
     * @param params 拖拽参数
     * @param map OpenLayers Map
     */
    moveLayer(
        { dragKey, dropKey, dropToGap, dropPosition }: MoveLayerParams,
    ) {
        
        if (!this.map) return;

        const dragLayer = getLayerById(this.map, dragKey);
        const dropLayer = getLayerById(this.map, dropKey);

        if (!dragLayer || !dropLayer) {
            console.warn("moveLayer: 找不到 dragLayer 或 dropLayer");
            return;
        }

        const fromCollection = getParentCollection(this.map, dragLayer);
        if (!fromCollection) return;

        // === 情况 1：拖拽到节点内部（进入 Group）===
        if (!dropToGap) {
            if (!(dropLayer instanceof LayerGroup)) return;
            const targetCollection = dropLayer.getLayers();

            let insertIndex = targetCollection.getLength(); // 默认放末尾
            if (fromCollection === targetCollection) {
                const currentIndex = targetCollection.getArray().indexOf(dragLayer);
                if (currentIndex < insertIndex) insertIndex -= 1;
            }

            console.debug(
                "[moveLayer][INSIDE] dragKey=%s dropKey=%s insertIndex=%d",
                dragKey,
                dropKey,
                insertIndex
            );

            fromCollection.remove(dragLayer);
            targetCollection.insertAt(insertIndex, dragLayer);
            return;
        }

        // === 情况 2：拖拽到 gap（同级移动）===
        const parentCollection = getParentCollection(this.map, dropLayer);
        if (!parentCollection) return;

        const siblings = parentCollection.getArray();
        const dropOlIndex = siblings.indexOf(dropLayer);

        let insertIndex: number;
        if (dropPosition === -1) {
            // Tree 上方 -> OL 底层靠后一点 → insertAt(dropOlIndex + 1)
            insertIndex = dropOlIndex + 1;
        } else {
            // Tree 下方 -> OL 底层靠前一点 → insertAt(dropOlIndex)
            insertIndex = dropOlIndex;
        }

        // 如果在同一个父集合，还要修正 index
        const dragOlIndex =
            fromCollection === parentCollection ? siblings.indexOf(dragLayer) : -1;
        if (dragOlIndex !== -1 && dragOlIndex < insertIndex) {
            insertIndex -= 1;
        }

        // 边界保护
        insertIndex = Math.max(0, Math.min(parentCollection.getLength(), insertIndex));

        console.debug(
            "[moveLayer][GAP] dragKey=%s dropKey=%s dropPos=%d dropOlIndex=%d dragOlIndex=%d finalInsertIndex=%d",
            dragKey,
            dropKey,
            dropPosition,
            dropOlIndex,
            dragOlIndex,
            insertIndex
        );

        fromCollection.remove(dragLayer);
        parentCollection.insertAt(insertIndex, dragLayer);
        
    }

    removeLayerOrGroup(layerId: string) {
        const layer = getLayerById(this.map, layerId);
        if (!layer) return;

        // 获取父集合
        const parentCollection = getParentCollection(this.map, layer);
        if (parentCollection) {
            parentCollection.remove(layer);
        } else {
            // 如果没有父集合，尝试从顶层移除
            this.map.getLayers().remove(layer);
        }
    }
    // 显示所有图层
    showAllLayers() {
        this.map.getLayers().forEach((layer: any) => {
            setLayerAndChildrenVisible(layer, true);
        });
    }

    // 隐藏所有图层
    hideAllLayers() {
        this.map.getLayers().forEach((layer: any) => {
            setLayerAndChildrenVisible(layer, false);
        });
    }

    // 显示选中图层
    showSelectedLayers() {
        const selectedIds = this.getSelectedLayerIds();
        selectedIds.forEach((id) => {
            const layer = getLayerById(this.map, id);
            if (layer) setLayerAndChildrenVisible(layer, true);
        });
    }

    // 隐藏选中图层
    hideSelectedLayers() {
        const selectedIds = this.getSelectedLayerIds();
        selectedIds.forEach((id) => {
            const layer = getLayerById(this.map, id);
            if (layer) setLayerAndChildrenVisible(layer, false);
        });
    }

    // 反转选中图层的可见性
    toggleSelectedLayers() {
        const selectedIds = this.getSelectedLayerIds();
        selectedIds.forEach((id) => {
            const layer = getLayerById(this.map, id);
            if (layer) layer.setVisible(!layer.getVisible());
        });
    }

    renameLayer(id:string,name:string){
        
      let layer=  getLayerById(this.map,id);
      if(!layer){
        console.warn(`not found the layer`);
        return
      }
      layer.set('name',name);
    }
}
