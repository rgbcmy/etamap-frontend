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
    layer?: IBaseLayer; // 添加自定义字段
}
export function layerToTreeNode(layer: IBaseLayer): TreeDataNode {
    const node: LayerTreeDataNode = {
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
        const baseLayerDto = (info.node as LayerTreeDataNode).layer;
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

    function applyTreeToMap(map: Map, tree: LayerTreeDataNode[]) {
        // 顶层：注意 tree 的顶层是 reverse 显示（layers.slice().reverse()）
        const topDesired = tree
            .slice()
            .reverse()
            .map(n => getLayerById(map, String(n.key)))
            .filter(Boolean);

        ensureCollectionOrder(map.getLayers(), topDesired);

        // 递归每个 group，根据 tree children（reverse 回 OL 顺序）调整 group.getLayers()
        const traverse = (node: LayerTreeDataNode) => {
            if (node.layer?.type === 'Group') {
                const groupLayer = getLayerById(map, String(node.key)) as LayerGroup | null;
                if (groupLayer) {
                    const desired = (node.children || [])
                        .slice()
                        .reverse()
                        .map((c: any) => getLayerById(map, String(c.key)))
                        .filter(Boolean);
                    ensureCollectionOrder(groupLayer.getLayers(), desired);
                }
            }
            (node.children || []).forEach((ch: LayerTreeDataNode) => traverse(ch));
        };
        tree.forEach(traverse);
    }
    const onDrop: TreeProps['onDrop'] = (info) => {
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
        // 7) 再把 Map 的各个 collection（顶层 + 每个 group）根据 tree 的结构重建顺序
        try {
            applyTreeToMap(map, data);
        } catch (e) {
            console.error('同步 Map 到 Tree 出错', e);
        }

        // 8) （可选但推荐）重新 serialize 一次，确保 tree 来源唯一且和 Map 完全一致
       // updateTree(map);
        // 5) 同步到 OpenLayers 的 layer 集合
        // try {
        //     const dragLayer = dragObj.layer ? getLayerById(map, dragObj.layer.id) : null;
        //     const dropLayer = dropNodeRef.layer ? getLayerById(map, dropNodeRef.layer.id) : null;

        //     if (dragLayer && dropLayer) {
        //         if (!info.dropToGap) {
        //             // 放到 Group 的子级：目标 collection = dropLayer.getLayers()
        //             const targetCollection = dropLayer instanceof LayerGroup ? dropLayer.getLayers() : getParentCollection(map, dropLayer);
        //             if (targetCollection) {
        //                 // 插入位置需要注意：你的 treeData 在显示时对 group 内部做了 reverse（layers.slice().reverse()），
        //                 // 所以把节点 unshift 到 children[0]，在 OL 的 collection 中应该是插入到尾部（append）。
        //                 // 这里我们按 children 中的位置反推到 OL 的插入位置：
        //                 const children = dropNodeRef.children || [];
        //                 let layergroup: LayerGroup;
        //                 const childIndexInTree = children.indexOf(dragObj);
        //                 const insertIndex = Math.max(0, targetCollection.getLength() - childIndexInTree);
        //                 // 从原父集合移除
        //                 const fromCollection = getParentCollection(map, dragLayer);
        //                 if (fromCollection) {
        //                     fromCollection.remove(dragLayer);
        //                 }
        //                 // 插入
        //                 const idxToInsert = Math.min(targetCollection.getLength(), insertIndex);
        //                 targetCollection.insertAt(idxToInsert, dragLayer);
        //             }
        //         } else {
        //             // 在同级前/后插入：目标 collection = parent of dropLayer
        //             const parentCollection = getParentCollection(map, dropLayer);
        //             if (parentCollection) {
        //                 // dropLayer 在 parentCollection 的 index
        //                 const dropIndex = parentCollection.getArray().indexOf(dropLayer);
        //                 const insertIndex = dropPosition === -1 ? dropIndex : dropIndex + 1;
        //                 const fromCollection = getParentCollection(map, dragLayer);
        //                 if (fromCollection) fromCollection.remove(dragLayer);
        //                 parentCollection.insertAt(insertIndex, dragLayer);
        //             }
        //         }
        //     }
        //     // 最后刷新 Tree，保证 UI 和 OL 一致
        //     updateTree(map);
        // } catch (e) {
        //     console.error('同步 OpenLayers 时出错', e);
        // }
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