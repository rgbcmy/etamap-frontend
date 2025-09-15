import React, { useEffect, useRef, useState } from "react";
import MapComponent from "../MapComponent/MapComponent";
import StatusBar from "../StatusBar/StatusBar";
import styles from "./AppLayout.module.css";
import LayerManager from "../layerTree/LayerManager";
import { Menu } from "../Menu/Menu";

export default function AppLayout() {
    const [map, setMap] = useState<any>(null);
    const [mapConfig, setMapConfig] = useState<any>(null); // 新增，用于传给 MapComponent
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>();
    const [scale, setScale] = useState<number>();
    const [rotation, setRotation] = useState<number>(0);
    const [leftWidth, setLeftWidth] = useState(300);
    const isResizing = useRef(false);

    const handleMenuAction = async (type: string) => {
        switch (type) {
            case "new-file":
                // 创建一个新地图配置
                setMapConfig({
                    layers: [],
                    view: { center: [0, 0], zoom: 2 }
                });
                break;
            case "open-file":
                // 这里可以用 <input type="file" /> 或者 FilePicker
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".etm,.json";
                input.onchange = async (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                        const text = await file.text();
                        try {
                            const json = JSON.parse(text);
                            setMapConfig(json);
                        } catch (err) {
                            alert("文件格式错误！");
                        }
                    }
                };
                input.click();
                break;
            case "save-file":
                if (mapConfig) {
                    const blob = new Blob([JSON.stringify(mapConfig, null, 2)], {
                        type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "project.etm";
                    a.click();
                    URL.revokeObjectURL(url);
                }
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
                    config={mapConfig}   // 把配置传给 MapComponent
                    onMapReady={setMap}
                />
            </div>
            <StatusBar
                map={map}

            />
        </div>
    );
}
