import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import type { ServiceConnection, RemoteLayer } from '../types/dataSource';
import type { AddLayerConfig } from '../types/dataSource';
import type Layer from 'ol/layer/Layer';

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