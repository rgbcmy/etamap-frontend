import type { IBaseLayer, IGroupLayer } from 'openlayers-serializer';

import type { TreeDataNode } from 'antd';
export interface LayerTreeDataNode extends TreeDataNode {
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
export function flattenTreeKeys(nodes: TreeDataNode[]): string[] {
    let keys: string[] = [];
    for (const node of nodes) {
        keys.push(String(node.key));
        if (node.children) {
            keys = keys.concat(flattenTreeKeys(node.children));
        }
    }
    return keys;
}
