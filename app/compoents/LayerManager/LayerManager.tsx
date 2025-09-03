import React, { useEffect, useRef, useState } from "react";
import MapComponent from "../MapComponent/MapComponent";
import { Map } from "ol";
import { Tree, type TreeDataNode, type TreeProps } from 'antd';
import { serializeMapLayers } from 'openlayers-serializer/serializer';
import type { IBaseLayer, IGroupLayer } from "openlayers-serializer/dto";
interface LayerManagerProps {
    map?: Map;
}
interface LayerTreeNode extends TreeDataNode {
    layer?: IBaseLayer; // 添加自定义字段
}
export function layerToTreeNode(layer: IBaseLayer): TreeDataNode {
    const node: LayerTreeNode = {
        key: layer.id,
        title: layer.name,
        isLeaf: layer.type !== 'group', // group 是非叶子，其他是叶子
        layer: layer, // 挂载原始对象
    };

    if (layer.type === 'group') {
        const groupLayer = layer as IGroupLayer;
        node.children = groupLayer.layers.map(layerToTreeNode);
    }

    return node;
}

export function layersToTree(layers: IBaseLayer[]): TreeDataNode[] {
    return layers.map(layerToTreeNode);
}
export function getVisibleKeys(layers: IBaseLayer[]): string[] {
    const keys: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && layer.children) {
            keys.push(...getVisibleKeys(layer.children));
        } else if (layer.visible) {
            keys.push(layer.id);
        }
    });
    return keys;
}
export default function LayerManager({ map }: LayerManagerProps) {
    const [layers, setLayers] = useState<any[]>([]);
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    useEffect(() => {
        if (!map) {
            return;
        }
        debugger
        let layerDtos: IBaseLayer[] = serializeMapLayers(map);
        setLayers(layerDtos);

        // 监听图层变化
        const layers = map.getLayers();
        const listenerKey = layers.on('change:length', () => {

            const newDtos = serializeMapLayers(map);
            setLayers(newDtos);
            setTreeData(layersToTree(newDtos));
            setCheckedKeys(getVisibleKeys(newDtos));
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
        setCheckedKeys(checkedKeys as React.Key[])
    };
    return (
        <div>图层管理
            <Tree
                checkable
                onSelect={onSelect}
                checkedKeys={checkedKeys}
                onCheck={onCheck}
                treeData={treeData}
            />
        </div>
    )
}