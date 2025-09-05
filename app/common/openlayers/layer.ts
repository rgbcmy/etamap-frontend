import type BaseLayer from "ol/layer/Base";
import LayerGroup from "ol/layer/Group";
import type { Collection, Map } from "ol";

function findLayerById(layers: BaseLayer[], id: string): BaseLayer | undefined {
    for (const layer of layers) {
        if (layer.get("id") === id) {
            return layer;
        }
        if (layer instanceof LayerGroup) {
            const found = findLayerById(layer.getLayers().getArray(), id);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}
function findLayerByName(layers: BaseLayer[], name: string): BaseLayer | undefined {
    for (const layer of layers) {
        if (layer.get("name") === name) {
            return layer;
        }
        if (layer instanceof LayerGroup) {
            const found = findLayerById(layer.getLayers().getArray(), name);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}
/**
 * 
 * @param layers 根据属性查询符合条件的第一个值
 * @param key 
 * @param value 
 * @returns 
 */
function findLayerByProperty(layers: BaseLayer[], key: string, value: any): BaseLayer | undefined {
    for (const layer of layers) {
        if (layer.get(key) === value) {
            return layer;
        }
        if (layer instanceof LayerGroup) {
            const found = findLayerByProperty(layer.getLayers().getArray(), key, value);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}

/**
 * 获取指定图层的父级（可能是 Map 或 LayerGroup）
 */
export function getParentLayer(map: Map, targetLayer: BaseLayer): LayerGroup | Map | null {
    const rootLayers = map.getLayers();

    // 顶层
    if (rootLayers.getArray().includes(targetLayer)) {
        return map;
    }

    // 递归搜索 group
    function searchGroup(group: LayerGroup): LayerGroup | null {
        const childLayers = group.getLayers().getArray();
        if (childLayers.includes(targetLayer)) {
            return group;
        }
        for (const layer of childLayers) {
            if (layer instanceof LayerGroup) {
                const found = searchGroup(layer);
                if (found) return found;
            }
        }
        return null;
    }

    for (const layer of rootLayers.getArray()) {
        if (layer instanceof LayerGroup) {
            const found = searchGroup(layer);
            if (found) return found;
        }
    }

    return null;
}
/**
 * 获取指定图层的父集合（直接返回 Collection）
 */
export function getParentCollection(map: Map, targetLayer: BaseLayer): Collection<BaseLayer> | null {
    const rootLayers = map.getLayers();

    // 顶层
    if (rootLayers.getArray().includes(targetLayer)) {
        return rootLayers;
    }

    // 递归搜索 group
    function searchGroup(group: LayerGroup): Collection<BaseLayer> | null {
        const childLayers = group.getLayers();
        if (childLayers.getArray().includes(targetLayer)) {
            return childLayers;
        }
        for (const layer of childLayers.getArray()) {
            if (layer instanceof LayerGroup) {
                const found = searchGroup(layer);
                if (found) return found;
            }
        }
        return null;
    }

    for (const layer of rootLayers.getArray()) {
        if (layer instanceof LayerGroup) {
            const found = searchGroup(layer);
            if (found) return found;
        }
    }

    return null;
}
/**
 * 根据属性查询所有匹配的图层（递归遍历 LayerGroup）
 */
function findLayersByProperty(
    layers: BaseLayer[],
    key: string,
    value: any
): BaseLayer[] {
    const result: BaseLayer[] = [];

    for (const layer of layers) {
        if (layer.get(key) === value) {
            result.push(layer);
        }
        if (layer instanceof LayerGroup) {
            const childMatches = findLayersByProperty(layer.getLayers().getArray(), key, value);
            result.push(...childMatches);
        }
    }

    return result;
}
/**
 * 设置图层及其子图层的可见性（递归）
 */
export function setLayerAndChildrenVisible(layer: BaseLayer, visible: boolean) {
  layer.setVisible(visible);
  if (layer instanceof LayerGroup) {
    layer.getLayers().forEach(child => {
      setLayerAndChildrenVisible(child, visible);
    });
  }
}
export function getLayerById(map: Map, id: string): BaseLayer | undefined {
    return findLayerById(map.getLayers().getArray(), id);
}
export function getLayerByName(map: Map, name: string): BaseLayer | undefined {
    return findLayerByName(map.getLayers().getArray(), name);
}
export function getLayerByProperty(map: Map, key:string,value: any): BaseLayer | undefined {
    return findLayerByProperty(map.getLayers().getArray(), key,value);
}
export function getLayersByProperty(map: Map, key:string,value: any): BaseLayer[] | undefined {
    return findLayersByProperty(map.getLayers().getArray(),key,value);
}

//todo 添加插入函数查询图层，或者插入表达式字符串