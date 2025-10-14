import React, { useEffect } from "react";
import EtmSourceTreeView from "./view/EtmSourceTreeView";
import { DataSourceService } from "./actions/DataSourceService";
import type { Map as OLMap } from "ol";
import type { ISource } from "node_modules/openlayers-serializer/dist/dto/source";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import "antd/dist/reset.css";

interface DataSourcePanelProps {
  map: OLMap;
}

export default function DataSourcePanel({ map }: DataSourcePanelProps) {
  //const service = new DataSourceService(map);
  const { t } = useTranslation();
  const service = React.useMemo(() => new DataSourceService(t), [t]);
  const [sources, setSources] = React.useState<ISource[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  //初始化 sources
  useEffect(() => {
    setSources([...service.getSources()]);
  }, [service]);

  const getGroupedSources = () => {
    return {
      XYZ: sources.filter(s => s.type === "XYZ"),
      TileWMS: sources.filter(s => s.type === "TileWMS"),
      Zoomify: sources.filter(s => s.type === "Zoomify"),
      WMTS: sources.filter(s => s.type === "WMTS"),
      TileJSON: sources.filter(s => s.type === "TileJSON"),
      TileArcGISRest: sources.filter(s => s.type === "TileArcGISRest"),
      OGCMapTile: sources.filter(s => s.type === "OGCMapTile"),
      VectorTile: sources.filter(s => s.type === "VectorTile"),
      OGCVectorTile: sources.filter(s => s.type === "OGCVectorTile"),
      GeoTIFF: sources.filter(s => s.type === "GeoTIFF"),
      UTFGrid: sources.filter(s => s.type === "UTFGrid"),
      ImageArcGISRest: sources.filter(s => s.type === "ImageArcGISRest"),
      ImageStatic: sources.filter(s => s.type === "ImageStatic"),
      ImageWMS: sources.filter(s => s.type === "ImageWMS"),
      Vector: sources.filter(s => s.type === "Vector"),
    }
  };

  const refreshSources = () => {
    
    setSources([...service.getSources()]);
  }

  const addSource = (groupKey: string, source: ISource) => {
    
    service.addSource(groupKey, source);
    refreshSources();
  };

  const deleteSource = (id: string) => {
    service.deleteSource(id);
    refreshSources();
  };

  const editSource = (groupKey: string, source: any) => {
    
    service.editSource(source);
    refreshSources();
  };

  const addToMap = (source: any) => {
    
    if (!map) {
      messageApi.warning(
        t("dataSource.error.mapNotReady") || "请先创建或打开一个工程，再添加图层"
      );
      return;
    }
    service.addToMap(source, map);
  };

  return (
    <>
      {/**必须有这个 */}
      {contextHolder}
      <EtmSourceTreeView
        groupedSources={getGroupedSources()}
        onAddToMap={addToMap}
        onEdit={editSource}
        onDelete={deleteSource}
        onAddNew={addSource}
        onRefreshGroup={() => refreshSources()}
      />
    </>
  );
}
