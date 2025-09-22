import Map from 'ol/Map'
import { useEffect, useMemo, useState } from "react";
import { flattenTreeKeys, getVisibleKeys, layersToTree, type LayerTreeDataNode } from "./model/EtmLayerTreeModel";
import { serializeMapLayers } from "openlayers-serializer";
import { EtmLayerTreeActions, type MoveLayerParams } from './actions/EtmLayerTreeActions';
import { LayerTreeView } from './view/EtmLayerTreeView';
import type { TreeDataNode, TreeProps } from 'antd';
import type { EventDataNode } from 'antd/es/tree';
interface LayerManagerProps { map?: Map; /**是否联动子图层 */ linkParentChild?: boolean; }
export default function LayerManager({ map, linkParentChild = false }: LayerManagerProps) {
    const [layerActions, setLayerActions] = useState<EtmLayerTreeActions | null>(null);
    const [treeData, setTreeData] = useState<LayerTreeDataNode[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    useEffect(() => {
        debugger
        if (!map) {
            return;
        }
        setLayerActions(new EtmLayerTreeActions(map));
        updateTree(map);
        const listenerKey: any = map.getLayers().on('change:length', () => updateTree(map));
        return () => map.getLayers().un(listenerKey.type, listenerKey.listener);
    }, [map]);

    const updateTree = (map: Map) => {
        const layers = serializeMapLayers(map);
        setTreeData(layersToTree(layers));
        setCheckedKeys(getVisibleKeys(layers));
    }

    const handleCheck = (checkedKeys: React.Key[], info: any) => {
        if (!map) {
            return;
        }
        setCheckedKeys(checkedKeys);
        layerActions?.toggleLayerVisibility(info.node.layer.id, info.checked, linkParentChild);
        //updateTree(map);
    }

    const handleDrop: TreeProps['onDrop'] = (info) => {
        if (!map) {
            return
        }
        //const dropPosition: -1 | 0 | 1 = (info.dropToGap ? info.dropPosition : 0) as any;
        const params: MoveLayerParams = {
            dragKey: info.dragNode.key.toString(),
            dropKey: info.node.key.toString(),
            dropToGap: info.dropToGap,
            dropPosition: info.dropPosition
        };

        layerActions?.moveLayer(params);

        // 根据 Map 重新生成 treeData
        updateTree(map);
        //setTreeData(newTreeData);
    }

    const handleAddGroup = () => {
        if (!map) {
            return;
        }
        //逻辑是当选中多个图层或者(一个图层 但他是图层不是图层组的时候)是新建一个图层组，把选中的都放里面；否则则是添加一个空的图层组
        let groupInfo = layerActions?.addGroup();
        updateTree(map);
        //todo 展开这个组
        if (groupInfo) {
            if (groupInfo.parentGroupId) {
                setExpandedKeys([...expandedKeys, groupInfo.parentGroupId])
            } else {
                setExpandedKeys([...expandedKeys, groupInfo?.newGroupId])
            }
        }



    }
    const handleExpend = (keys: React.Key[]) => {

        setExpandedKeys(keys)
    }
    const handleSelect = (
        keys: React.Key[],
        info: {
            selected: boolean;
            node: EventDataNode<LayerTreeDataNode>;
            nativeEvent: MouseEvent;
        }
    ) => {
        let resKeys: React.Key[] = [];
        const { key } = info.node;
        const { ctrlKey, metaKey, shiftKey, button } = info.nativeEvent; // button: 0 左键，2 右键
        const isMultiSelectKey = ctrlKey || metaKey; // Windows: Ctrl, macOS: Cmd
        const isRightClick = button === 2;
        if (isRightClick) {

            // 右键逻辑
            if (selectedKeys.includes(key)) {
                // 已经选中 → 不处理
                resKeys = [...selectedKeys];
            } else {
                // 没有选中 → 单选当前节点
                resKeys = [key];
            }
        } else if (shiftKey && selectedKeys.length > 0) {
            // Shift 连选
            const allKeys = flattenTreeKeys(treeData);
            const lastKey = selectedKeys[selectedKeys.length - 1];
            const start = allKeys.indexOf(String(lastKey));
            const end = allKeys.indexOf(String(key));
            if (start !== -1 && end !== -1) {
                const range = allKeys.slice(Math.min(start, end), Math.max(start, end) + 1);
                resKeys = (Array.from(new Set([...selectedKeys, ...range])));
            }
        } else if (isMultiSelectKey) {
            // Cmd / Ctrl 切换选中
            if (selectedKeys.includes(key)) {
                resKeys = selectedKeys.filter(k => k !== key); // 取消选中
            } else {
                resKeys = [...selectedKeys, key]; // 加入选中
            }
        } else {
            // 单选
            resKeys = [key];
        }
        layerActions?.setSelectedLayerIds(resKeys.map(key => key.toString()))
        setSelectedKeys(resKeys);
    };


    const handleRemoveLayer = () => {

        selectedKeys.forEach((key) => {
            layerActions?.removeLayerOrGroup(key.toString())
        })


    }
    // 清空选中
    const clearSelect = () => {
        setSelectedKeys([]);
        layerActions?.setSelectedLayerIds([]);
    };
    return (
        <LayerTreeView
            checkStrictly={!linkParentChild}
            treeData={treeData}
            checkedKeys={checkedKeys}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onCheck={handleCheck}
            onSelect={handleSelect}
            onDrop={handleDrop}
            onExpand={handleExpend}
            onAddGroup={handleAddGroup}
            onExpandAll={() => setExpandedKeys(flattenTreeKeys(treeData))}
            onCollapseAll={() => setExpandedKeys([])}
            onRemoveLayer={handleRemoveLayer}
            onShowAllLayers={() => {
                if (!map) {
                    return
                }
                layerActions?.showAllLayers();
                updateTree(map)
            }}
            onHideAllLayers={() => {
                if (!map) {
                    return
                }
                layerActions?.hideAllLayers()
                updateTree(map)
            }}
            onShowSelectedLayers={() => {
                if (!map) {
                    return
                }
                layerActions?.showSelectedLayers();
                updateTree(map)
            }}
            onHideSelectedLayers={() => {
                if (!map) {
                    return
                }
                layerActions?.hideSelectedLayers()
                updateTree(map)
            }}
            onToggleSelectedLayers={() => {

                if (!map) {
                    return
                }
                layerActions?.toggleSelectedLayers()
                updateTree(map)
            }}
            onRename={(id, newName) => {

                if (!map) {
                    return
                }
                layerActions?.renameLayer(id, newName);
                updateTree(map); // 刷新 treeData
            }}
            clearSelect={clearSelect}  
        />
    )
}