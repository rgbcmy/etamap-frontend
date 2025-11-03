// 服务类型
export type ServiceType = 'wms' | 'wmts' | 'wfs' | 'xyz' | 'arcgis';

// 服务连接（持久化到 IndexedDB）
export interface ServiceConnection {
  id: string;
  name: string;
  type: ServiceType;
  url: string;
  params?: Record<string, string>;
  auth?: {
    type?: 'none' | 'basic' | 'apikey' | 'bearer';
    username?: string;
    password?: string;
    token?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// 远端图层（从 Capabilities 解析，临时缓存）
export interface RemoteLayer {
  id: string;
  connectionId: string;
  name: string;
  title?: string;
  abstract?: string;
  crs?: string[];
  bbox?: {
    minx: number;
    miny: number;
    maxx: number;
    maxy: number;
    crs?: string;
  };
  styles?: Array<{ name: string; title?: string }>;
  formats?: string[];
  children?: RemoteLayer[]; // 支持图层组嵌套
  isQueryable?: boolean;
  fetchedAt?: string;
}

// Tree 节点类型
export type TreeNodeType = 'root' | 'type-group' | 'connection' | 'layer-group' | 'layer';

// Tree 节点数据
export interface TreeNodeData {
  key: string;
  title: string;
  type: TreeNodeType;
  icon?: React.ReactNode;
  isLeaf?: boolean;
  children?: TreeNodeData[];
  
  // 类型组相关
  serviceType?: ServiceType;
  
  // 连接相关
  connectionId?: string;
  connection?: ServiceConnection;
  
  // 图层相关
  layerId?: string;
  layer?: RemoteLayer;
  
  // 状态
  loading?: boolean;
  error?: string;
}

// 添加图层配置
export interface AddLayerConfig {
  name: string;
  visible: boolean;
  opacity: number;
  minZoom?: number;
  maxZoom?: number;
  style?: string;
  format?: string;
  crs?: string;
  transparent?: boolean;
  bgcolor?: string;
  zIndex?: number;
}

// 保存的图层记录
export interface SavedLayerConfig {
  id: string;
  type: ServiceType;
  connectionId?: string;
  remoteLayerId?: string;
  name: string;
  olLayerConfig: {
    layerType: 'Tile' | 'Image' | 'Vector';
    sourceType: 'TileWMS' | 'ImageWMS' | 'XYZ' | 'WMTS' | 'Vector';
    sourceParams: {
      url: string;
      params?: Record<string, any>;
    };
    layerParams?: {
      opacity?: number;
      visible?: boolean;
      zIndex?: number;
    };
  };
  createdAt: string;
}