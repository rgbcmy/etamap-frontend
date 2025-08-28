import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { ScaleLine } from "ol/control";
import {defaults as defaultInteractions} from 'ol/interaction/defaults.js';
import OSM from "ol/source/OSM";

interface MapComponentProps {
  onMapReady?: (map: Map) => void;
}

export default function MapComponent({
  onMapReady,
}: MapComponentProps) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mapInstance = new Map({
      target: containerRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: [0, 0],
        zoom: 2,
        constrainRotation:true,
        projection:"EPSG:3857"
      }),
      controls: [new ScaleLine({ units: "metric" })],
      //interactions: defaultInteractions(),
      
    });

    mapRef.current = mapInstance;
    onMapReady?.(mapInstance);

    const view = mapInstance.getView();

    // const updateStatus = () => {
    //   const center = view.getCenter() || [0, 0];
    //   const zoom = view.getZoom() || 1;
    //   const rotation = view.getRotation() || 0;
    // };

    // mapInstance.on("moveend", updateStatus);

    // // 初始化状态
    // updateStatus();

    return () => {
      mapInstance.setTarget(undefined); // 清理
    };
  }, []);

  return <div ref={containerRef} style={{ flex: 1 }} />;
}
