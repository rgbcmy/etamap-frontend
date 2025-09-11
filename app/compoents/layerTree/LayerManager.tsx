import Map from 'ol/Map'
import { useEffect, useMemo, useState } from "react";
import { flattenTreeKeys, getVisibleKeys, layersToTree, type LayerTreeDataNode } from "./model/EtmLayerTreeModel";
import { serializeMapLayers } from "openlayers-serializer";
import { EtmLayerTreeActions, type MoveLayerParams } from './actions/EtmLayerTreeActions';
import { LayerTreeView } from './view/EtmLayerTreeView';
import type { TreeDataNode, TreeProps } from 'antd';
interface LayerManagerProps { map?: Map; /**是否联动子图层 */ linkParentChild?: boolean; }
export default function LayerManager({ map, linkParentChild = false }: LayerManagerProps) {
    const [layerActions, setLayerActions] = useState<EtmLayerTreeActions | null>(null);
    const [treeData, setTreeData] = useState<LayerTreeDataNode[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

    useEffect(() => {
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
        layerActions?.addGroup();
    }
    const handleExpend = (keys: React.Key[]) => {
        debugger
        setExpandedKeys(keys)
    }
    return (
        <LayerTreeView
            checkStrictly={!linkParentChild}
            treeData={treeData}
            checkedKeys={checkedKeys}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onCheck={handleCheck}
            onSelect={setSelectedKeys}
            onDrop={handleDrop}
            onExpand={handleExpend}
            onAddGroup={handleAddGroup}
            onExpandAll={() => setExpandedKeys(flattenTreeKeys(treeData))}
            onCollapseAll={() => setExpandedKeys([])}
        />
    )
}