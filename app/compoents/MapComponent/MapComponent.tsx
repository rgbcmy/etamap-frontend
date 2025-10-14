import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { ScaleLine } from "ol/control";
import { defaults as defaultInteractions } from 'ol/interaction/defaults.js';
import OSM from "ol/source/OSM";
import LayerGroup from "ol/layer/Group";
import { XYZ } from "ol/source";
import type { TileCoord } from "ol/tilecoord";
import { quadKey } from "ol/source/BingMaps";
import type { Projection } from "ol/proj";

interface MapComponentProps {
   map?: Map;
}

export default function MapComponent({ map }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    
    if (map && containerRef.current) {
      map.setTarget(containerRef.current);
    }
    return () => {
      map?.setTarget(undefined);
    };
  }, [map]);

  return <div ref={containerRef} style={{ flex: 1 }} />;
}
