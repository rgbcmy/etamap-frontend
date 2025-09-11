import Map from 'ol/Map';
import { getLayerById, setLayerAndChildrenVisible, getParentCollection } from '../../../common/openlayers/layer'
//import type { TreeDataNode } from 'antd';
import LayerGroup from 'ol/layer/Group';
export interface MoveLayerParams {
    dragKey: string;
    dropKey: string;
    dropToGap: boolean;
    dropPosition: number;//-1 | 0 | 1; // -1为上方，0为内部，1为下方(tree视觉上的，非ol内部)
}
export class EtmLayerTreeActions {
    private map: Map;
    private currentLayerKey: string | null = null;
    private selectedLayerKeys: string[] = [];

    constructor(map: Map) {
        this.map = map;
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
        debugger
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
        debugger
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
        debugger
    }
    addGroup(name?: string) {

    }
    removeLayerOrGroup(layerId: string) {

    }
}
