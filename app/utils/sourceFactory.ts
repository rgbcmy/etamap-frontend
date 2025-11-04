import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import type { ServiceConnection, RemoteLayer } from '../types/dataSource';
import type { AddLayerConfig } from '../types/dataSource';
import type Layer from 'ol/layer/Layer';
import type { IXYZ, ITileWMS } from 'node_modules/openlayers-serializer/dist/dto/source';
import { deserializeSource, deserializeLayer } from 'openlayers-serializer';
import type { IBaseLayer } from 'node_modules/openlayers-serializer/dist/dto/layer';

/**
 * 检查数据源是否支持直接从 connection 添加到地图（无需选择具体 layer）
 */
export function canAddConnectionDirectly(connection: ServiceConnection): boolean {
  return connection.type === 'xyz';
}

/**
 * 根据 connection 信息直接创建图层（用于 XYZ 等不需要 layer 信息的数据源）
 * 使用 openlayers-serializer 进行反序列化
 */
export function createLayerFromConnection(
  connection: ServiceConnection,
  config?: Partial<AddLayerConfig>
): Layer {
  const defaultConfig: AddLayerConfig = {
    name: connection.name,
    visible: true,
    opacity: 1.0,
    ...config,
  };

  if (connection.type === 'xyz') {
    // 构建 IXYZ 接口对象
    const xyzSource: IXYZ = {
      id: connection.id,
      name: connection.name,
      type: 'XYZ',
      url: connection.url || undefined,
      minZoom: connection.params?.minZoom ? parseInt(connection.params.minZoom) : undefined,
      maxZoom: connection.params?.maxZoom ? parseInt(connection.params.maxZoom) : undefined,
      tileSize: connection.params?.tileSize ? JSON.parse(connection.params.tileSize) : undefined,
      crossOrigin: connection.params?.crossOrigin || undefined,
      projection: connection.params?.projection || undefined,
      wrapX: connection.params?.wrapX !== undefined ? connection.params.wrapX === 'true' : undefined,
      transition: connection.params?.transition ? parseInt(connection.params.transition) : undefined,
      // 高级参数
      attributions: connection.params?.attributions ? JSON.parse(connection.params.attributions) : undefined,
      attributionsCollapsible: connection.params?.attributionsCollapsible !== undefined ? connection.params.attributionsCollapsible === 'true' : undefined,
      interpolate: connection.params?.interpolate !== undefined ? connection.params.interpolate === 'true' : undefined,
      opaque: connection.params?.opaque === 'true' || undefined,
      tilePixelRatio: connection.params?.tilePixelRatio ? parseFloat(connection.params.tilePixelRatio) : undefined,
      gutter: connection.params?.gutter ? parseInt(connection.params.gutter) : undefined,
      reprojectionErrorThreshold: connection.params?.reprojectionErrorThreshold ? parseFloat(connection.params.reprojectionErrorThreshold) : undefined,
      zDirection: connection.params?.zDirection ? parseInt(connection.params.zDirection) : undefined,
      maxResolution: connection.params?.maxResolution ? parseFloat(connection.params.maxResolution) : undefined,
      cacheSize: connection.params?.cacheSize ? parseInt(connection.params.cacheSize) : undefined,
      tileGrid: connection.params?.tileGrid ? JSON.parse(connection.params.tileGrid) : undefined,
      tileLoadFunction: connection.params?.tileLoadFunction || undefined,
      tileUrlFunction: connection.params?.tileUrlFunction || undefined,
    };

    // 使用 openlayers-serializer 反序列化 source
    const source = deserializeSource(xyzSource);

    // 构建 IBaseLayer 接口对象
    const layerDto: IBaseLayer = {
      id: crypto.randomUUID(),
      name: defaultConfig.name,
      type: 'Tile',
      className: 'ol-layer',
      opacity: defaultConfig.opacity || 1,
      visible: defaultConfig.visible !== undefined ? defaultConfig.visible : true,
      extent: null,
      minResolution: null,
      maxResolution: null,
      minZoom: defaultConfig.minZoom || null,
      maxZoom: defaultConfig.maxZoom || null,
      zIndex: defaultConfig.zIndex || null,
      background: null,
      properties: null,
      source: xyzSource,
    };

    // 使用 openlayers-serializer 反序列化 layer
    const olLayer = deserializeLayer(layerDto) as Layer;

    // 设置额外属性
    olLayer.set('connectionId', connection.id);
    olLayer.set('type', 'xyz');

    return olLayer;
  }

  // 其他类型需要 layer 信息，不支持直接从 connection 创建
  throw new Error(`Service type ${connection.type} requires layer selection. Please expand the connection and select a specific layer.`);
}

export function createLayerWithConfig(
  connection: ServiceConnection,
  layer: RemoteLayer,
  config: AddLayerConfig
): Layer {
  
  if (connection.type === 'wms') {
    const params: any = {
      LAYERS: layer.name,
      VERSION: connection.params?.version || '1.3.0',
      FORMAT: config.format || 'image/png',
      TRANSPARENT: config.transparent !== false ? 'TRUE' : 'FALSE',
    };

    if (config.style) {
      params.STYLES = config.style;
    }

    if (config.bgcolor && !config.transparent) {
      params.BGCOLOR = config.bgcolor.replace('#', '0x');
    }

    if (connection.params) {
      Object.entries(connection.params).forEach(([k, v]) => {
        if (!['version'].includes(k.toLowerCase())) {
          params[k] = v;
        }
      });
    }

    const source = new TileWMS({
      url: connection.url,
      params,
      crossOrigin: 'anonymous',
      projection: config.crs,
    });

    const olLayer = new TileLayer({
      source,
      opacity: config.opacity,
      visible: config.visible,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      zIndex: config.zIndex,
    });

    olLayer.set('name', config.name);
    olLayer.set('connectionId', connection.id);
    olLayer.set('layerId', layer.id);
    olLayer.set('type', 'wms');

    return olLayer;
  }

  if (connection.type === 'xyz') {
    const source = new XYZ({
      url: connection.url,
      minZoom: connection.params?.zmin ? parseInt(connection.params.zmin) : config.minZoom,
      maxZoom: connection.params?.zmax ? parseInt(connection.params.zmax) : config.maxZoom,
      tileSize: connection.params?.tileSize ? parseInt(connection.params.tileSize) : 256,
      crossOrigin: 'anonymous',
    });

    const olLayer = new TileLayer({
      source,
      opacity: config.opacity,
      visible: config.visible,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      zIndex: config.zIndex,
    });

    olLayer.set('name', config.name);
    olLayer.set('connectionId', connection.id);
    olLayer.set('type', 'xyz');

    return olLayer;
  }

  if (connection.type === 'wfs') {
    const url = new URL(connection.url);
    url.searchParams.set('service', 'WFS');
    url.searchParams.set('version', connection.params?.version || '2.0.0');
    url.searchParams.set('request', 'GetFeature');
    url.searchParams.set('typename', layer.name);
    url.searchParams.set('outputFormat', connection.params?.outputFormat || 'application/json');
    url.searchParams.set('srsname', config.crs || 'EPSG:3857');

    const source = new VectorSource({
      url: url.toString(),
      format: new GeoJSON(),
    });

    const olLayer = new VectorLayer({
      source,
      opacity: config.opacity,
      visible: config.visible,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      zIndex: config.zIndex,
    });

    olLayer.set('name', config.name);
    olLayer.set('connectionId', connection.id);
    olLayer.set('layerId', layer.id);
    olLayer.set('type', 'wfs');

    return olLayer;
  }

  throw new Error(`Unsupported service type: ${connection.type}`);
}