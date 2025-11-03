import WMSCapabilities from 'ol/format/WMSCapabilities';
import type { ServiceConnection, RemoteLayer, SavedLayerConfig } from '../types/dataSource';
import {
  getCapabilitiesCache,
  saveCapabilitiesCache,
} from './indexedDB';

function buildCapabilitiesURL(connection: ServiceConnection): string {
  const url = new URL(connection.url);
  
  if (connection.type === 'wms') {
    url.searchParams.set('service', 'WMS');
    url.searchParams.set('request', 'GetCapabilities');
    url.searchParams.set('version', connection.params?.version || '1.3.0');
  } else if (connection.type === 'wmts') {
    url.searchParams.set('service', 'WMTS');
    url.searchParams.set('request', 'GetCapabilities');
  }
  
  if (connection.params) {
    Object.entries(connection.params).forEach(([key, value]) => {
      if (!['version'].includes(key.toLowerCase())) {
        url.searchParams.set(key, value);
      }
    });
  }
  
  return url.toString();
}

function buildHeaders(connection: ServiceConnection): HeadersInit {
  const headers: HeadersInit = {};
  
  if (connection.auth?.type === 'basic' && connection.auth.username && connection.auth.password) {
    headers['Authorization'] = `Basic ${btoa(`${connection.auth.username}:${connection.auth.password}`)}`;
  } else if (connection.auth?.type === 'bearer' && connection.auth.token) {
    headers['Authorization'] = `Bearer ${connection.auth.token}`;
  } else if (connection.auth?.type === 'apikey' && connection.auth.token) {
    headers['X-API-Key'] = connection.auth.token;
  }
  
  return headers;
}

export async function fetchWMSLayers(
  connection: ServiceConnection,
  forceRefresh: boolean = false
): Promise<RemoteLayer[]> {
  if (!forceRefresh) {
    const cached = await getCapabilitiesCache(connection.id);
    if (cached) {
      console.log('Using cached capabilities for', connection.name);
      return cached.data as RemoteLayer[];
    }
  }
  
  try {
    const url = buildCapabilitiesURL(connection);
    const headers = buildHeaders(connection);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const parser = new WMSCapabilities();
    const result = parser.read(text);
    
    const layers: RemoteLayer[] = [];
    
    function walkLayersRecursive(layerNode: any, connectionId: string): RemoteLayer | null {
      if (!layerNode.Name) {
        // 没有 Name 的是纯图层组，递归处理子图层
        if (layerNode.Layer && Array.isArray(layerNode.Layer)) {
          layerNode.Layer.forEach((child: any) => {
            const childLayer = walkLayersRecursive(child, connectionId);
            if (childLayer) {
              layers.push(childLayer);
            }
          });
        }
        return null;
      }
      
      const layer: RemoteLayer = {
        id: `${connectionId}::${layerNode.Name}`,
        connectionId,
        name: layerNode.Name,
        title: layerNode.Title,
        abstract: layerNode.Abstract,
        crs: layerNode.CRS || layerNode.SRS || [],
        bbox: layerNode.BoundingBox?.[0]
          ? {
              minx: layerNode.BoundingBox[0].extent[0],
              miny: layerNode.BoundingBox[0].extent[1],
              maxx: layerNode.BoundingBox[0].extent[2],
              maxy: layerNode.BoundingBox[0].extent[3],
              crs: layerNode.BoundingBox[0].crs,
            }
          : undefined,
        styles: layerNode.Style?.map((s: any) => ({
          name: s.Name,
          title: s.Title,
        })),
        formats: result.Capability?.Request?.GetMap?.Format || [],
        isQueryable: layerNode.queryable || false,
        fetchedAt: new Date().toISOString(),
      };
      
      if (layerNode.Layer && layerNode.Layer.length > 0) {
        layer.children = [];
        layerNode.Layer.forEach((child: any) => {
          const childLayer = walkLayersRecursive(child, connectionId);
          if (childLayer) {
            layer.children!.push(childLayer);
          }
        });
      }
      
      return layer;
    }
    
    const rootLayer = result?.Capability?.Layer;
    if (rootLayer) {
      if (rootLayer.Layer && Array.isArray(rootLayer.Layer)) {
        rootLayer.Layer.forEach((child: any) => {
          const layer = walkLayersRecursive(child, connection.id);
          if (layer) {
            layers.push(layer);
          }
        });
      } else {
        const layer = walkLayersRecursive(rootLayer, connection.id);
        if (layer) {
          layers.push(layer);
        }
      }
    }
    
    await saveCapabilitiesCache(connection.id, layers, 24);
    
    return layers;
  } catch (error) {
    console.error('Failed to fetch WMS capabilities:', error);
    throw error;
  }
}

export async function fetchXYZLayer(connection: ServiceConnection): Promise<RemoteLayer> {
  return {
    id: connection.id,
    connectionId: connection.id,
    name: connection.name,
    title: connection.name,
    formats: ['image/png'],
    fetchedAt: new Date().toISOString(),
  };
}

export function createLayerConfig(
  layer: RemoteLayer,
  connection: ServiceConnection
): SavedLayerConfig {
  const params: any = {
    LAYERS: layer.name,
    VERSION: connection.params?.version || '1.3.0',
    FORMAT: layer.formats?.[0] || 'image/png',
    TRANSPARENT: 'true',
  };
  
  return {
    id: crypto.randomUUID(),
    type: connection.type,
    connectionId: connection.id,
    remoteLayerId: layer.id,
    name: layer.title || layer.name,
    olLayerConfig: {
      layerType: 'Tile',
      sourceType: 'TileWMS',
      sourceParams: {
        url: connection.url,
        params,
      },
      layerParams: {
        opacity: 1.0,
        visible: true,
      },
    },
    createdAt: new Date().toISOString(),
  };
}