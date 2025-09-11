import React, { useEffect, useRef, useState } from "react";
import MapComponent from "../MapComponent/MapComponent";
import StatusBar from "../StatusBar/StatusBar";
import styles from "./AppLayout.module.css";
import LayerManager from "../layerTree/LayerManager";
import { Menu } from "../Menu/Menu";

export default function AppLayout() {
    const [map, setMap] = useState<any>(null);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>();
    const [scale, setScale] = useState<number>();
    const [rotation, setRotation] = useState<number>(0);
    const [leftWidth, setLeftWidth] = useState(300);
    const isResizing = useRef(false);
    const onMouseDown = (e: React.MouseEvent) => {
        isResizing.current = true;
        e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isResizing.current) return;
        const newWidth = e.clientX;
        const screenWidth = window.innerWidth;
        setLeftWidth(Math.max(50, Math.min(newWidth, screenWidth-50))); // 最小150px，最大600px
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
                <Menu onAction={function (type: string): void {
                    throw new Error("Function not implemented.");
                } }></Menu>
            </header>
            <div className={styles.main}>
                <div className={styles.leftPanel} style={{ width: leftWidth }}>
                   
                    <LayerManager map={map}></LayerManager>
                    <div className={styles.resizer} onMouseDown={onMouseDown}></div>
                </div>
                <MapComponent
                    onMapReady={setMap}
                />
            </div>
            <StatusBar
                map={map}

            />
        </div>
    );
}
