import type { IMap } from "node_modules/openlayers-serializer/dist/dto/map";
import { Map } from "ol";
import { serializeMap, deserializeMap } from "openlayers-serializer";

interface NewFileOptions {
    resetView?: boolean;       // 是否重置视图（center/zoom）
    rebuildMap?: boolean;      // 是否重新创建 Map 实例
    container?: HTMLElement;   // rebuildMap 时需要传入 container
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
    newFile(options?: NewFileOptions) {
        if (!this.map && !options?.rebuildMap) return;

        if (options?.rebuildMap) {
            if (!options.container) {
                throw new Error("Container is required to rebuild Map");
            }
            // 假设你有 MapComponent 的初始化逻辑，这里可以调用或返回新的 Map
            this.map = new Map({
                target: options.container,
                layers: [],
                view: {
                    center: [0, 0],
                    zoom: 2,
                } as any,
            });
        } else {
            // 清空图层
            this.map!.getLayers().clear();
            if (options?.resetView ?? true) {
                const view = this.map!.getView();
                view.setCenter([0, 0]);
                view.setZoom(2);
                view.setRotation(0);
            }
        }
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
