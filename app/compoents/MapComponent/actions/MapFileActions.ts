import type { IMap } from "node_modules/openlayers-serializer/dist/dto/map";
import { Map, View } from "ol";
import { Projection } from "ol/proj";
import { serializeMap, deserializeMap } from "openlayers-serializer";
interface NewFileOptions {
    zoom?: number;
    projection?: string;
    center?:number[];
}

export class MapFileActions {
    private map?: Map;

    constructor(map?: Map) {
        this.map = map;
        
    }

    setMap(map: Map) {
        this.map = map;
    }

    /** 新建工程文件 */
    newFile(name:string,viewOptions:NewFileOptions) {
        // 假设你有 MapComponent 的初始化逻辑，这里可以调用或返回新的 Map
        
        let map = new Map({
            layers: [],   
            view: new View({
                center: viewOptions.center??[0, 0],
                zoom:  viewOptions.zoom??2,
                projection:viewOptions.projection??"EPSG:3857"
            }),
        });
        map.set('name',name)
        this.map=map;
        return this.map
    }

    /** 打开工程文件 */
    openFile(config: IMap) {
        // if (!this.map) return;
        if ("target" in config) {
            delete (config as any).target;
        }
        this.map = deserializeMap(config);
        return this.map
    }

    /** 保存工程文件 */
    saveFile(): string | undefined {
        if (!this.map) return;
        const config = serializeMap(this.map);
        if ("target" in config) {
            delete (config as any).target;
        }
        return JSON.stringify(config);
    }

    /** 导出地图为图片 */
    exportImage(): void {
        if (!this.map) return;

        this.map.once("rendercomplete", () => {
            const canvas = document.createElement("canvas");
            const size = this.map!.getSize();
            if (!size) return;
            canvas.width = size[0];
            canvas.height = size[1];
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            Array.prototype.forEach.call(
                this.map!.getViewport().querySelectorAll<HTMLCanvasElement>(".ol-layer canvas"),
                (canvasLayer) => {
                    if (canvasLayer.width > 0) ctx.drawImage(canvasLayer, 0, 0);
                }
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "map.png";
                    link.click();
                }
            });
        });

        this.map.renderSync();
    }
}
