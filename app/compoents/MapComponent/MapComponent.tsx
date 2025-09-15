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
  config?:any,
  onMapReady?: (map: Map) => void;
}

export default function MapComponent({
  onMapReady,
}: MapComponentProps) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    let osmLayer = new TileLayer({ source: new OSM() });
    osmLayer.setProperties({ id: crypto.randomUUID(), name: "OSM" });
    let bingLayer = new TileLayer({
      source: new XYZ({
        //url: 'https://dev.virtualearth.net/REST/V1/Imagery/Metadata/Aerial?output=json&include=ImageryProviders&key=YourBingMapsKey',
        tileUrlFunction: function (tileCoord: TileCoord, pixelRatio: number, projection: Projection): string | undefined {
          let imageUrl = 'http://ecn.t1.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1';
          let url = new URL(
            //imageUrl.replace('{quadkey}', quadKey(tileCoord)),
            imageUrl.replace('{q}', quadKey(tileCoord)),
          );
          return url.toString();
        }
      })
    })
    bingLayer.setProperties({ id: crypto.randomUUID(), name: "Bing" })

    let layergroup = new LayerGroup({
      layers: [osmLayer, bingLayer]
    })
    layergroup.setProperties({ id: crypto.randomUUID(), name: "Group" })

     let layergroup1 = new LayerGroup({
      layers: []
    })
    layergroup1.setProperties({ id: crypto.randomUUID(), name: "Group1" })
    let amapsLayer = new TileLayer({
      source: new XYZ({
        url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
      })
    })
    amapsLayer.setProperties({ id: crypto.randomUUID(), name: "AMap" })
    const mapInstance = new Map({
      target: containerRef.current,
      layers: [layergroup,layergroup1,amapsLayer],
      view: new View({
        center: [0, 0],
        zoom: 2,
        constrainRotation: true,
        projection: "EPSG:3857"
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
