import { useEffect, useState } from "react";
import { Map } from "ol";
import { getScale } from "~/MapHelper";
import { ScaleLine } from "ol/control";
import styles from "./StatusBar.module.css";

interface StatusBarProps {
    map?: Map;
}

export default function StatusBar({ map }: StatusBarProps) {
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [projection, setProjection] = useState('EPSG:3857');
    const [renderEnabled, setRenderEnabled] = useState(true);
    useEffect(() => {
        if (!map) return;

        const view = map.getView();

        const updateStatus = () => {
            setProjection(view.getProjection()?.getCode());
            const center = view.getCenter() || [0, 0];
            setCoordinates({ x: center[0], y: center[1] });
            // let mapScale=getScale(map);
            let scaleLine: ScaleLine = map.getControls().getArray().find(c => c instanceof ScaleLine) as ScaleLine;
            if (scaleLine.getScaleForResolution) {
                let mapScale = scaleLine?.getScaleForResolution();
                setScale(mapScale || 1);
            }

            setRotation(view.getRotation() * (180 / Math.PI) || 0);
        };

        map.on("moveend", updateStatus);

        return () => {
            map.un("moveend", updateStatus);
        };
    }, [map, renderEnabled]);
    // 3️⃣ 切换 Render
    const toggleRender = (e: React.ChangeEvent<HTMLInputElement>) => {
    };
    //todo  实现render开关(参考QGIS十否开启渲染，可以定格某一时刻的地图)
    return (
        <footer className={styles.statusFooter}>
            坐标: {coordinates.x.toFixed(6)}, {coordinates.y.toFixed(6)} |
            比例尺: 1:{Math.round(scale)} |
            旋转: {rotation.toFixed(0)}° | 坐标系: {projection}
            <label style={{ marginLeft: "10px" }}>
                <input type="checkbox" checked={renderEnabled} onChange={toggleRender} />{" "}
                Render
            </label>
        </footer>
    );
}
