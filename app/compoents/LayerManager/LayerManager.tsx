import React, { useEffect, useRef, useState } from "react";
import MapComponent from "../MapComponent/MapComponent";
import { Map } from "ol";
import { Tree, type TreeDataNode, type TreeProps } from 'antd';
import { serializeMapLayers } from 'openlayers-serializer';
import type { IBaseLayer, IGroupLayer } from "openlayers-serializer";
import { getLayerById, setLayerAndChildrenVisible, getParentLayer, getParentCollection } from "~/common/openlayers/layer";
import LayerGroup from "ol/layer/Group";
interface LayerManagerProps {
    map?: Map;
    /**是否联动子图层 */
    linkParentChild?: boolean;
}
interface LayerTreeDataNode extends TreeDataNode {
    id: string,
    layer: IBaseLayer
    //layer?: IBaseLayer; // 添加自定义字段
}
export function layerToTreeNode(layer: IBaseLayer): LayerTreeDataNode {
    const node: LayerTreeDataNode = {
        id: layer.id,
        key: layer.id,
        title: layer.name,
        isLeaf: layer.type !== 'Group', // group 是非叶子，其他是叶子
        layer: layer, // 挂载原始对象
    };

    if (layer.type === 'Group') {
        const groupLayer = layer as IGroupLayer;
        // 子图层也倒序显示
        node.children = groupLayer.layers.slice().reverse().map(layerToTreeNode);
    }

    return node;
}

export function layersToTree(layers: IBaseLayer[]): LayerTreeDataNode[] {
    let nodes = layers.slice().reverse().map(layerToTreeNode);
    // 倒序，使最上层图层显示在最前面
    return nodes
}
export function getVisibleKeys(layers: IBaseLayer[]): string[] {
    const keys: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'Group' && layer.layers) {
            if (layer.visible) {
                keys.push(layer.id);
            }
            keys.push(...getVisibleKeys(layer.layers));
        } else if (layer.visible) {
            keys.push(layer.id);
        }
    });
    return keys;
}

export default function LayerManager({ map, linkParentChild = false }: LayerManagerProps) {
    const [layers, setLayers] = useState<any[]>([]);
    const [treeData, setTreeData] = useState<LayerTreeDataNode[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    useEffect(() => {
        if (!map) {
            return;
        }
        // let layerDtos: IBaseLayer[] = serializeMapLayers(map);
        // setLayers(layerDtos);
        updateTree(map)
        // 监听图层变化
        const layers = map.getLayers();
        const listenerKey = layers.on('change:length', () => {
            updateTree(map)
            // const newDtos = serializeMapLayers(map);
            // setLayers(newDtos);
            // let layerTree = layersToTree(newDtos);
            // setTreeData(layerTree);
            // setCheckedKeys(getVisibleKeys(newDtos));
        });

        return () => {
            layers.un(listenerKey.type as "change:length", listenerKey.listener);
        };
    }, [map]);
    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
        console.log('onCheck', checkedKeys, info);
        setCheckedKeys(checkedKeys as React.Key[]);
        const baseLayerDto: IBaseLayer = (info.node as any).layer;
        if (!baseLayerDto) {
            return;
        }
        if (!map) {
            return
        }
        let layer = getLayerById(map, baseLayerDto.id);
        if (!layer) {
            return
        }
        //设置图层相关可见
        debugger
        if (!linkParentChild) {
            // 方案 A：不做父子联动
            layer.setVisible(info.checked);
        } else {
            // 方案 B：父子联动
            if (layer instanceof LayerGroup) {
                setLayerAndChildrenVisible(layer, info.checked)

            } else {
                setLayerAndChildrenVisible(layer, info.checked)
                // 可选：更新父组 visible,暂时不需要
                // 如果需要，可以递归检查父节点，保持父组 visible=true 只要有子节点可见
            }
        }




    };
    // 放在组件内部，与 onDrop 同级
    function ensureCollectionOrder(collection: any, desiredLayers: any[]) {
        if (!collection) return;
        // 逐个把 desiredLayers 放到 collection 的正确位置
        for (let i = 0; i < desiredLayers.length; i++) {
            const layer = desiredLayers[i];
            if (!layer) continue;
            const currArr = collection.getArray();
            const currIndex = currArr.indexOf(layer);

            if (currIndex === i) {
                // 已经在正确位置
                continue;
            }

            // 如果 layer 在别的集合里，先从原集合移除
            const from = getParentCollection(map!, layer);
            if (from && from !== collection) {
                from.remove(layer);
            } else if (currIndex !== -1) {
                // 在同一集合但位置不对，移除后再插入
                collection.remove(layer);
            }

            // 插入到目标集合的 i 位置
            collection.insertAt(i, layer);
        }

        // 删除目标集合末尾多余的 layer（如果有）
        while (collection.getLength() > desiredLayers.length) {
            const extra = collection.item(desiredLayers.length);
            if (!extra) break;
            collection.remove(extra);
        }
    }
    const onDrop: TreeProps['onDrop'] = (info) => {
        if (!map || !info.dragNode || !info.node) return;

        const dragKey = info.dragNode.key;
        const dropKey = info.node.key;

        const dropPosArr = info.node.pos.split('-');
        let dropPosition = info.dropPosition - Number(dropPosArr[dropPosArr.length - 1]);
        dropPosition = Math.sign(dropPosition); // 确保 -1 / 0 / 1

        const data = [...treeData];

        // ---------------------------
        // 递归查找节点
        // ---------------------------
        const loop = (nodes: TreeDataNode[], key: React.Key, callback: (node: TreeDataNode, index: number, arr: TreeDataNode[]) => void) => {
            for (let i = 0; i < nodes.length; i++) {
                if (String(nodes[i].key) === String(key)) {
                    callback(nodes[i], i, nodes);
                    return;
                }
                if (nodes[i].children) loop(nodes[i].children!, key, callback);
            }
        };

        let dragNodeRef: LayerTreeDataNode | any = null;
        let dropNodeRef: LayerTreeDataNode | any = null;

        loop(data, dragKey, (item) => dragNodeRef = item as LayerTreeDataNode);
        loop(data, dropKey, (item) => dropNodeRef = item as LayerTreeDataNode);

        if (!dragNodeRef || !dropNodeRef) return;

        // 防止父节点放到自己的子孙里
        const hasDescendant = (node: TreeDataNode | null, key: React.Key): boolean => {
            if (!node || !node.children) return false;
            for (const c of node.children) {
                if (String(c.key) === String(key)) return true;
                if (hasDescendant(c, key)) return true;
            }
            return false;
        };
        if (hasDescendant(dragNodeRef, dropKey)) {
            console.warn('不能把父节点放到自己的子孙里');
            return;
        }

        // 放入非 Group 子级禁止
        if (!info.dropToGap && dropNodeRef.layer.type !== 'Group') {
            console.warn('不能把图层放到非 Group 节点子级');
            return;
        }

        // ---------------------------
        // 从 Tree 删除 dragNode
        // ---------------------------
        let dragObj: LayerTreeDataNode | null = null;
        loop(data, dragKey, (item, index, arr) => {
            dragObj = item as LayerTreeDataNode;
            arr.splice(index, 1);
        });
        if (!dragObj) return;

        // ---------------------------
        // 操作 OL 图层
        // ---------------------------
        try {
            const dragLayer = getLayerById(map, String(dragKey));
            const dropLayer = getLayerById(map, String(dropKey));
            if (!dragLayer || !dropLayer) return;

            const fromCollection = getParentCollection(map, dragLayer);
            if (!fromCollection) return;

            if (!info.dropToGap) {
                // ===== 放到 Group 内 =====
                const targetCollection = dropLayer instanceof LayerGroup ? dropLayer.getLayers() : getParentCollection(map, dropLayer);
                if (!targetCollection) return;

                const insertIndex = dropLayer instanceof LayerGroup
                    ? targetCollection.getLength() // 插入到 Group 末尾
                    : targetCollection.getLength(); // 非 Group 不允许，但保险起见
                fromCollection.remove(dragLayer);
                targetCollection.insertAt(insertIndex, dragLayer);

            } else {
                // ===== 同级拖拽 =====
                const parentCollection = getParentCollection(map, dropLayer);
                if (!parentCollection) return;

                let dropIndex = parentCollection.getArray().indexOf(dropLayer);
                if (dropIndex === -1) dropIndex = parentCollection.getLength();

                // dropPosition 处理
                let insertIndex = dropIndex;
                if (dropPosition === 1) insertIndex = dropIndex + 1;
                else if (dropPosition === 0 && dropLayer instanceof LayerGroup) {
                    // 插入 Group 内
                    const targetCollection = dropLayer.getLayers();
                    fromCollection.remove(dragLayer);
                    targetCollection.insertAt(targetCollection.getLength(), dragLayer);
                    updateTree(map);
                    return;
                } else if (dropPosition === 0) {
                    // 非 Group 当作下方插入
                    insertIndex = dropIndex + 1;
                }

                // 同父集合拖拽修正
                const dragIndex = fromCollection === parentCollection ? parentCollection.getArray().indexOf(dragLayer) : -1;
                if (dragIndex !== -1 && dragIndex < insertIndex) insertIndex -= 1;

                insertIndex = Math.max(0, Math.min(parentCollection.getLength(), insertIndex));

                fromCollection.remove(dragLayer);
                parentCollection.insertAt(insertIndex, dragLayer);
            }

        } catch (e) {
            console.error('同步 OpenLayers 时出错', e);
        }

        // 更新 Tree UI
        updateTree(map);
    };

    // const onDrop: TreeProps['onDrop'] = (info) => {
    //     if (!map || !info.dragNode || !info.node) return;

    //     const dragKey = info.dragNode.key;
    //     const dropKey = info.node.key;
    //     const dropPos = info.node.pos.split('-');
    //     const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    //     const data = [...treeData]; // 内存副本

    //     // 递归查找节点
    //     const loop = (nodes: TreeDataNode[], key: React.Key, callback: (node: TreeDataNode, index: number, arr: TreeDataNode[]) => void) => {
    //         for (let i = 0; i < nodes.length; i++) {
    //             if (nodes[i].key === key) {
    //                 callback(nodes[i], i, nodes);
    //                 return;
    //             }
    //             if (nodes[i].children) loop(nodes[i].children!, key, callback);
    //         }
    //     };

    //     // 找到 drop 节点
    //     let dropNodeRef: LayerTreeDataNode | any = null;
    //     loop(data, dropKey, (item) => { dropNodeRef = item as LayerTreeDataNode; });
    //     if (!dropNodeRef) return;

    //     // 不能放到非 Group 子节点
    //     if (!info.dropToGap && dropNodeRef.layer.type !== 'Group') return;

    //     // 防止拖拽到自己子孙
    //     let dragCandidate: LayerTreeDataNode | null = null;
    //     loop(data, dragKey, (item) => { dragCandidate = item as LayerTreeDataNode; });

    //     const hasDescendant = (node: TreeDataNode | null, key: React.Key): boolean => {
    //         if (!node || !node.children) return false;
    //         for (const c of node.children) {
    //             if (c.key === key) return true;
    //             if (hasDescendant(c, key)) return true;
    //         }
    //         return false;
    //     };
    //     if (dragCandidate && hasDescendant(dragCandidate, dropKey)) return;

    //     // 1) 先在内存 Tree 移动节点
    //     let dragObj: LayerTreeDataNode | null = null;
    //     loop(data, dragKey, (item, index, arr) => {
    //         dragObj = item as LayerTreeDataNode;
    //         arr.splice(index, 1);
    //     });
    //     if (!dragObj) return;

    //     if (!info.dropToGap) {
    //         // 放到 Group 内
    //         dropNodeRef.children = dropNodeRef.children || [];
    //         dropNodeRef.children.unshift(dragObj); // 内存 Tree 已更新
    //     } else {
    //         // 同级前/后
    //         let arrRef: TreeDataNode[] = [];
    //         let idx = 0;
    //         loop(data, dropKey, (_item, index, arr) => { arrRef = arr; idx = index; });
    //         if (dropPosition === -1) arrRef.splice(idx, 0, dragObj);
    //         else arrRef.splice(idx + 1, 0, dragObj);
    //     }

    //     // 2) 操作 OL
    //     try {
    //         const dragLayer = getLayerById(map, String(dragKey));
    //         const dropLayer = getLayerById(map, String(dropKey));
    //         if (!dragLayer || !dropLayer) return;

    //         const fromCollection = getParentCollection(map, dragLayer);

    //         if (!info.dropToGap) {
    //             // 放到 Group 内
    //             const targetCollection = dropLayer instanceof LayerGroup ? dropLayer.getLayers() : getParentCollection(map, dropLayer);
    //             if (!targetCollection) return;

    //             const children:any[] = dropNodeRef.children!;
    //             const treeChildIndex = children.findIndex(c => String(c.key) === String(dragKey));
    //             const insertIndex = children.length - 1 - treeChildIndex;

    //             if (fromCollection) fromCollection.remove(dragLayer);
    //             targetCollection.insertAt(Math.max(0, Math.min(targetCollection.getLength(), insertIndex)), dragLayer);
    //         } else {
    //             // 同级前/后
    //             const parentCollection = getParentCollection(map, dropLayer);
    //             if (!parentCollection) return;

    //             const findParentInfo = (nodes: TreeDataNode[], key: React.Key): { parentArray: TreeDataNode[]; index: number } | null => {
    //                 for (let i = 0; i < nodes.length; i++) {
    //                     if (String(nodes[i].key) === String(key)) return { parentArray: nodes, index: i };
    //                     if (nodes[i].children) {
    //                         const res = findParentInfo(nodes[i].children!, key);
    //                         if (res) return res;
    //                     }
    //                 }
    //                 return null;
    //             };
    //             const parentInfo = findParentInfo(data, dropKey);
    //             const treeDropIndex = parentInfo ? parentInfo.index : parentCollection.getArray().indexOf(dropLayer);
    //             const siblingCount = parentInfo ? parentInfo.parentArray.length : parentCollection.getLength();

    //             let dropOlIndex = siblingCount - 1 - treeDropIndex;
    //             const desiredInsertIndex = dropPosition === -1 ? dropOlIndex + 1 : dropOlIndex;

    //             const dragOlIndex = fromCollection === parentCollection ? parentCollection.getArray().indexOf(dragLayer) : -1;
    //             if (fromCollection && dragOlIndex !== -1 && dragOlIndex < dropOlIndex) dropOlIndex -= 1;

    //             if (fromCollection) fromCollection.remove(dragLayer);
    //             parentCollection.insertAt(Math.max(0, Math.min(parentCollection.getLength(), desiredInsertIndex)), dragLayer);
    //         }
    //     } catch (e) {
    //         console.error('同步 OpenLayers 时出错', e);
    //     }

    //     // 3) 刷新 Tree UI
    //     updateTree(map);
    // };
    const onDrop1: TreeProps['onDrop'] = (info) => {
        if (!map || !info.dragNode || !info.node) return;

        const dragKey = info.dragNode.key;
        const dropKey = info.node.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const data = [...treeData];

        // 递归查找节点
        const loop = (nodes: TreeDataNode[], key: React.Key, callback: (node: TreeDataNode, index: number, arr: TreeDataNode[]) => void) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].key === key) {
                    callback(nodes[i], i, nodes);
                    return;
                }
                if (nodes[i].children) loop(nodes[i].children!, key, callback);
            }
        };

        // 1) 找到 drop 节点
        let dropNodeRef: LayerTreeDataNode | any = null;
        loop(data, dropKey, (item) => { dropNodeRef = item as LayerTreeDataNode; });
        if (!dropNodeRef) return;

        // 2) 放入子级但目标不是 Group，取消
        if (!info.dropToGap && dropNodeRef.layer.type !== 'Group') {
            console.warn('不能把图层放到非 Group 节点的子级里，取消操作');
            return;
        }

        // 3) 防止父节点放到自己的子孙里
        let dragCandidate: LayerTreeDataNode | null = null;
        loop(data, dragKey, (item) => { dragCandidate = item as LayerTreeDataNode; });

        const hasDescendant = (node: LayerTreeDataNode | null, key: React.Key): boolean => {
            if (!node || !node.children) return false;
            for (const c of node.children as LayerTreeDataNode[]) {
                if (c.key === key) return true;
                if (hasDescendant(c, key)) return true;
            }
            return false;
        };

        if (dragCandidate && hasDescendant(dragCandidate, dropKey)) {
            console.warn('不能把父节点放到自己的子孙里，取消操作');
            return;
        }

        // 4) 找到并删除 dragObj（不改 Tree UI）
        let dragObj: LayerTreeDataNode | any = null;
        loop(data, dragKey, (item, index, arr) => {
            dragObj = item as LayerTreeDataNode;
            arr.splice(index, 1);
        });
        if (!dragObj) return;

        // ===== 先操作 OpenLayers =====
        try {
            const dragLayer = getLayerById(map, String(dragKey));
            const dropLayer = getLayerById(map, String(dropKey));
            if (!dragLayer || !dropLayer) return;

            const fromCollection = getParentCollection(map, dragLayer);

            if (!info.dropToGap) {
                // ===== 放到 Group 内 =====
                const targetCollection = dropLayer instanceof LayerGroup
                    ? dropLayer.getLayers()
                    : getParentCollection(map, dropLayer);
                if (!targetCollection) return;

                const children = [...(dropNodeRef.children || [])];
                const treeChildIndex = children.findIndex(c => String(c.key) === String(dragKey));

                const insertIndex = children.length - 1 - (treeChildIndex === -1 ? children.length : treeChildIndex);

                if (fromCollection) fromCollection.remove(dragLayer);
                targetCollection.insertAt(Math.max(0, Math.min(targetCollection.getLength(), insertIndex)), dragLayer);

            } else {
                // ===== 同级前/后 =====
                const parentCollection = getParentCollection(map, dropLayer);
                if (!parentCollection) return;

                const findParentInfo = (nodes: LayerTreeDataNode[], key: React.Key): { parentArray: LayerTreeDataNode[]; index: number } | null => {
                    for (let i = 0; i < nodes.length; i++) {
                        if (String(nodes[i].key) === String(key)) return { parentArray: nodes, index: i };
                        if (nodes[i].children) {
                            const res = findParentInfo(nodes[i].children as LayerTreeDataNode[], key);
                            if (res) return res;
                        }
                    }
                    return null;
                };

                const parentInfo = findParentInfo(data, dropKey);
                let treeDropIndex = parentInfo ? parentInfo.index : parentCollection.getArray().indexOf(dropLayer);
                let siblingCount = parentInfo ? parentInfo.parentArray.length : parentCollection.getLength();

                // Tree -> OL 倒序转换
                let dropOlIndex = siblingCount - 1 - treeDropIndex;
                const desiredInsertIndex = dropPosition === -1 ? dropOlIndex + 1 : dropOlIndex;

                const dragOlIndex = fromCollection === parentCollection ? parentCollection.getArray().indexOf(dragLayer) : -1;
                if (fromCollection && dragOlIndex !== -1 && dragOlIndex < dropOlIndex) {
                    dropOlIndex -= 1; // remove 后左移
                }

                if (fromCollection) fromCollection.remove(dragLayer);
                parentCollection.insertAt(Math.max(0, Math.min(parentCollection.getLength(), desiredInsertIndex)), dragLayer);
            }
        } catch (e) {
            console.error('同步 OpenLayers 时出错', e);
        }

        // ===== 再更新 Tree UI =====
        if (!info.dropToGap) {
            dropNodeRef.children = dropNodeRef.children || [];
            dropNodeRef.children.unshift(dragObj);
        } else {
            let arrRef: LayerTreeDataNode[] = [];
            let idx = 0;
            loop(data, dropKey, (_item, index, arr) => {
                arrRef = arr as LayerTreeDataNode[];
                idx = index;
            });
            if (dropPosition === -1) {
                arrRef.splice(idx, 0, dragObj);
            } else {
                arrRef.splice(idx + 1, 0, dragObj);
            }
        }
        //setTreeData(data);
        updateTree(map);
    };
    /**
     * 紧更新树，没有操作ol,仅用做对比
     * @param info
     * @returns 
     */
    const onDropJustTree: TreeProps['onDrop'] = (info) => {
        if (!map || !info.dragNode || !info.node) return;

        const dragKey = info.dragNode.key;
        const dropKey = info.node.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const data = [...treeData];

        // 查找节点的递归函数
        const loop = (
            nodes: TreeDataNode[],
            key: React.Key,
            callback: (node: TreeDataNode, index: number, arr: TreeDataNode[]) => void
        ) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].key === key) {
                    callback(nodes[i], i, nodes);
                    return;
                }
                if (nodes[i].children) {
                    loop(nodes[i].children!, key, callback);
                }
            }
        };
        // 1) 先找到 drop 节点（只查，不改）
        let dropNodeRef: LayerTreeDataNode | any = null;
        loop(data, dropKey, (item) => {
            dropNodeRef = item as LayerTreeDataNode;
        });
        if (!dropNodeRef) {
            return;
        }

        // 2) 如果是“放入子级（不是 gap）”但目标不是 Group，则直接拒绝
        if (!info.dropToGap && dropNodeRef.layer.type !== 'Group') {
            console.warn('不能把图层放到非 Group 节点的子级里，取消操作');
            return;
        }

        // 额外：先找到拖拽节点（但不删除），用于判断是否把父节点放到自己的子孙里
        let dragCandidate: LayerTreeDataNode | null = null;
        loop(data, dragKey, (item) => {
            dragCandidate = item as LayerTreeDataNode;
        });

        // 防止把节点放到自己的子孙里
        const hasDescendant = (node: LayerTreeDataNode | null, key: React.Key): boolean => {
            if (!node || !node.children) return false;
            for (const c of node.children as LayerTreeDataNode[]) {
                if (c.key === key) return true;
                if (hasDescendant(c, key)) return true;
            }
            return false;
        };
        if (dragCandidate && hasDescendant(dragCandidate, dropKey)) {
            console.warn('不能把父节点放到自己的子孙里，取消操作');
            return;
        }

        // 3) 找到并删除 dragObj（真正移除）
        let dragObj: LayerTreeDataNode | any = null;
        loop(data, dragKey, (item, index, arr) => {
            dragObj = item as LayerTreeDataNode;
            arr.splice(index, 1);
        });
        if (!dragObj) return;

        // 4) 根据 dropToGap / dropPosition 插入到 treeData（先只改 UI）
        if (!info.dropToGap) {
            // 放到目标节点的子级（之前已保证目标是 Group）
            dropNodeRef.children = dropNodeRef.children || [];
            // 这里使用 unshift（放在第一个子项）；如果你希望放到末尾可以改为 push 或 splice 指定位置
            dropNodeRef.children.unshift(dragObj);
        } else {
            // 同级上/下
            let arrRef: LayerTreeDataNode[] = [];
            let idx = 0;
            loop(data, dropKey, (_item, index, arr) => {
                arrRef = arr as LayerTreeDataNode[];
                idx = index;
            });
            if (dropPosition === -1) {
                // 放在上方
                arrRef.splice(idx, 0, dragObj);
            } else {
                // 放在下方
                arrRef.splice(idx + 1, 0, dragObj);
            }
        }


        // 更新 treeData
        setTreeData(data);
    };
    function updateTree(map: Map) {
        const newDtos = serializeMapLayers(map);
        setLayers(newDtos);
        let layerTree = layersToTree(newDtos);
        setTreeData(layerTree);
        setCheckedKeys(getVisibleKeys(newDtos));
    }

    return (
        <div>图层管理
            <Tree
                draggable
                checkable
                checkStrictly={!linkParentChild}
                onSelect={onSelect}
                onDrop={onDrop}
                checkedKeys={checkedKeys}
                onCheck={onCheck}
                treeData={treeData}
            />
        </div>
    )
}