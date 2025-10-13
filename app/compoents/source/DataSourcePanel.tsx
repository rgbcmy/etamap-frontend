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

  //初始化 sources
  useEffect(() => {
    setSources([...service.getSources()]);
  }, [service]);

  const getGroupedSources = () => {
    return {
      XYZ: sources.filter(s => s.type === "XYZ"),
    }
  };

  const refreshSources = () => {
    debugger
    setSources([...service.getSources()]);
  }

  const addSource = (groupKey: string, source: ISource) => {
    debugger
    service.addSource(groupKey, source);
    refreshSources();
  };

  const deleteSource = (id: string) => {
    service.deleteSource(id);
    refreshSources();
  };

  const editSource = (groupKey: string, source: any) => {
    debugger
    service.editSource(source);
    refreshSources();
  };

  const addToMap = (source: any) => {
    debugger
    if (!map) {
      message.warning("123")
      // message.warning(
      //   t("dataSource.error.mapNotReady") || "请先创建或打开一个工程，再添加图层"
      // );
      return;
    }
    service.addToMap(source, map);
  };

  return (
    <EtmSourceTreeView
      groupedSources={getGroupedSources()}
      onAddToMap={addToMap}
      onEdit={editSource}
      onDelete={deleteSource}
      onAddNew={addSource}
      onRefreshGroup={() => refreshSources()}
    />
  );
}
