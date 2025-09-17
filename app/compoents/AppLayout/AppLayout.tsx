import React, { useEffect, useRef, useState } from "react";
import MapComponent from "../MapComponent/MapComponent";
import StatusBar from "../StatusBar/StatusBar";
import styles from "./AppLayout.module.css";
import LayerManager from "../layerTree/LayerManager";
import { Menu } from "../Menu/Menu";
import { MapFileActions } from "../MapComponent/actions/MapFileActions";
import SaveAsModal from "../common/SaveAsModal";
import { useTranslation } from "react-i18next";
import type { IMap } from "node_modules/openlayers-serializer/dist/dto/map";
import NewMapModal from "../common/NewMapModal";

export default function AppLayout() {
    const { t } = useTranslation();
    const [saveAsVisible, setSaveAsVisible] = useState(false);
    const [newMapVisible, setNewMapVisible] = useState(false);
    const [projectTitle, setProjectTitle] = useState('');
    const [map, setMap] = useState<any>(null);
    const [leftWidth, setLeftWidth] = useState(300);
    const isResizing = useRef(false);
    const mapActions = useRef(new MapFileActions());
    const handleMenuAction = async (type: string) => {
        debugger
        switch (type) {
            case "newFile":
                  //显示新增弹窗
                setNewMapVisible(true);
                break;
            case "openFile":
                // 这里可以用 <input type="file" /> 或者 FilePicker
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".etm,.json";
                input.onchange = async (e: any) => {
                    const file = e.target.files[0];
                    const fullName = file.name;
                    const nameWithoutExt = fullName.substring(0, fullName.lastIndexOf("."));
                    if (file) {
                        const text = await file.text();
                        try {
                            const json: IMap = JSON.parse(text);
                            //如果map没有设置名称,则用文件名
                            if (!json.name) {
                                json.name = nameWithoutExt;
                            }
                            setProjectTitle(json.name)
                            let map = mapActions.current.openFile(json);
                            setMap(map);
                        } catch (err) {
                            alert(t("error.invalidFile"));
                            //alert("文件格式错误！");
                        }
                    }
                };
                input.click();
                break;
            case "saveFile":
                const json = mapActions.current.saveFile();
                if (json) {
                    const blob = new Blob([json], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = projectTitle ? `${projectTitle}.json` : "untitled-map.json";
                    a.click();
                    URL.revokeObjectURL(url);
                }
                break;
                break;
            case "saveAsFile":
                //显示另存为弹窗
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
                <Menu onAction={handleMenuAction} projectTitle={projectTitle}></Menu>
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
            <NewMapModal
                visible={newMapVisible}
                onCancel={() => setNewMapVisible(false)}
                onConfirm={(info) => {
                    debugger;
                    setNewMapVisible(false);
                    setProjectTitle(info.name);
                    const map = mapActions.current.newFile(info.name, {
                        center: info.center,
                        zoom: info.zoom,
                        projection: info.projection
                    });
                    debugger
                    setMap(map);
                }}
            />
        </div>
    );
}
