import React, { useEffect, useRef, useState } from "react";
import MapComponent from "../MapComponent/MapComponent";
import StatusBar from "../StatusBar/StatusBar";
import styles from "./AppLayout.module.css";
import LayerManager from "../layerTree/LayerManager";
import { Menu } from "../Menu/Menu";
import type { IMap } from "node_modules/openlayers-serializer/dist/dto/map";
import { MapFileActions } from "../MapComponent/actions/MapFileActions";
import SaveAsModal from "../common/SaveAsModal";

export default function AppLayout() {
    const [saveAsVisible, setSaveAsVisible] = useState(false);
    const [map, setMap] = useState<any>(null);
    const [leftWidth, setLeftWidth] = useState(300);
    const isResizing = useRef(false);
    const mapActions = useRef(new MapFileActions());
    const handleMenuAction = async (type: string) => {
        debugger
        switch (type) {
            case "newFile":
                // 创建一个新地图配置
                // setMapConfig({
                //     layers: [],
                //     view: { center: [0, 0], zoom: 2 }
                // });
                break;
            case "openFile":
                // 这里可以用 <input type="file" /> 或者 FilePicker
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".etm,.json";
                input.onchange = async (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                        const text = await file.text();
                        try {
                            const json: IMap = JSON.parse(text);
                            let map = mapActions.current.openFile(json);
                            setMap(map);
                        } catch (err) {
                            alert("文件格式错误！");
                        }
                    }
                };
                input.click();
                break;
            case "saveFile":
                //setSaveAsVisible(true);
                break;
            case "saveAsFile":
                setSaveAsVisible(true);
                break;
        }
    };

    const onMouseDown = (e: React.MouseEvent) => {
        isResizing.current = true;
        e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isResizing.current) return;
        const newWidth = e.clientX;
        const screenWidth = window.innerWidth;
        setLeftWidth(Math.max(50, Math.min(newWidth, screenWidth - 50))); // 最小150px，最大600px
    };

    const onMouseUp = () => {
        isResizing.current = false;
    };
    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, []);
    return (
        <div className={styles.appLayout}>
            <header className={styles.ribbon}>
                <Menu onAction={handleMenuAction}></Menu>
            </header>
            <div className={styles.main}>
                <div className={styles.leftPanel} style={{ width: leftWidth }}>

                    <LayerManager map={map}></LayerManager>
                    <div className={styles.resizer} onMouseDown={onMouseDown}></div>
                </div>
                <MapComponent
                    map={map}
                />
            </div>
            <StatusBar
                map={map}

            />
            <SaveAsModal
                visible={saveAsVisible}
                onCancel={() => setSaveAsVisible(false)}
                onConfirm={(filename) => {
                    setSaveAsVisible(false);
                    const json = mapActions.current.saveFile();
                    debugger
                    if (json) {
                        const blob = new Blob([json], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = filename;
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                }}
            />
        </div>
    );
}
