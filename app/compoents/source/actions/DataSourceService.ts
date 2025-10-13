// import { message } from "antd";
import type { i18n } from "i18next"; // 用于国际化提示
import type { ISerializedSource, ISource, IXYZ } from "node_modules/openlayers-serializer/dist/dto/source";
import type { Map as OLMap } from "ol";
import TileLayer from "ol/layer/Tile";
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
        //message.success(this.t("dataSource.message.addedToMap", { name: source.name }));
        break;
      default:
        //message.warning(this.t("dataSource.error.unsupportedType", { type: source.type }));
    }
  }
}
