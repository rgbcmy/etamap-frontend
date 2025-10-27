// import { message } from "antd";
import type { i18n } from "i18next"; // 用于国际化提示
import type { ISerializedSource, ISource, ITileWMS, IWMTS, IXYZ } from "node_modules/openlayers-serializer/dist/dto/source";
import type { Map as OLMap } from "ol";
import TileLayer from "ol/layer/Tile";
import { TileWMS } from "ol/source";
import XYZ from "ol/source/XYZ";
import { deserializeSource, serializeSource } from "openlayers-serializer";

import { useTranslation } from "react-i18next"

export class DataSourceService {
  private sources: ISource[] = [];
  private t: (key: string, params?: Record<string, any>) => string;
  private cache: Map<string, ISource> = new Map();
  constructor(
    t: (key: string, params?: Record<string, any>) => string // <- 传入 t 函数
  ) {
    this.t = t;
  }

  getSources(): ISource[] {
    return [...this.sources];
  }

  async loadRemoteSources(url: string): Promise<ISource[]> {
    try {
      const res = await fetch(url);
      const data: ISource[] = await res.json();
      this.sources = data;
      data.forEach(ds => this.cache.set(ds.id, ds));
      return [...this.sources];
    } catch (err) {
      //message.error(this.t("dataSource.error.loadFailed"));
      return [];
    }
  }

  addSource(groupKey: string, source: ISource): ISource[] {
    this.sources.push(source);
    this.cache.set(source.id, source);
    return [...this.sources];
  }

  editSource(updated: ISource): ISource[] {
    this.sources = this.sources.map(s => (s.id === updated.id ? updated : s));
    this.cache.set(updated.id, updated);
    return [...this.sources];
  }

  deleteSource(id: string): ISource[] {
    this.sources = this.sources.filter(s => s.id !== id);
    this.cache.delete(id);
    return [...this.sources];
  }

  addToMap(source: ISource, map: OLMap): void {
    switch (source.type) {
      case "XYZ":
        let xyzSource = deserializeSource(source as IXYZ)
        const layer = new TileLayer({
          source: xyzSource//new XYZ({ url: xyzSource.url ?? undefined })
        });
        map.addLayer(layer);
        break;
      case "TileWMS":
        // map.addLayer(new TileLayer({
        //   extent: [-13884991, 2870341, -7455066, 6338219],
        //   source: new TileWMS({
        //     url: 'https://ahocevar.com/geoserver/wms',
        //     params: { 'LAYERS': 'topp:states', 'TILED': true },
        //     serverType: 'geoserver',
        //     // Countries have transparency, so do not fade tiles:
        //     transition: 0,
        //   }),
        // }))
        let tileWMSSource = deserializeSource(source as ITileWMS)
        const tileWMSLayer = new TileLayer({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: tileWMSSource//new XYZ({ url: xyzSource.url ?? undefined })
        });
        map.addLayer(tileWMSLayer);
        break;
      case "WMTS":
        let wmtsSource = deserializeSource(source as IWMTS)
        const wmtsLayer = new TileLayer({
          source: wmtsSource//new XYZ({ url: xyzSource.url ?? undefined })
        });
        map.addLayer(wmtsLayer);
        break;
      default:
    }
  }
}
