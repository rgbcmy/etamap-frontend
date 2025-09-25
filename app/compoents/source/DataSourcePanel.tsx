import React, { useEffect } from "react";
import EtmSourceTreeView from "./view/EtmSourceTreeView";
import { DataSourceService } from "./actions/DataSourceService";
import type { Map as OLMap } from "ol";

interface DataSourcePanelProps {
  map: OLMap;
}

export default function DataSourcePanel({ map }: DataSourcePanelProps) {
  const service = new DataSourceService(map);
  const [sources, setSources] = React.useState(service.getSources());

  const getGroupedSources = () => ({
    xyz: sources.filter(s => s.type === "XYZ"),
  });

  const refreshSources = () => setSources(service.getSources());

  const addSource = (source: any) => {
    service.addSource(source);
    refreshSources();
  };

  const deleteSource = (id: string) => {
    service.deleteSource(id);
    refreshSources();
  };

  const editSource = (source: any) => {
    service.editSource(source);
    refreshSources();
  };

  const addToMap = (source: any) => {
    service.addToMap(source);
  };

  return (
    <EtmSourceTreeView
      groupedSources={getGroupedSources()}
      onAddToMap={addToMap}
      onEdit={editSource}
      onDelete={deleteSource}
      onAddNew={() =>
        addSource({
          id: String(Date.now()),
          name: "New XYZ",
          type: "XYZ",
          url: "https://example.com",
        })
      }
      onRefreshGroup={() => refreshSources()}
    />
  );
}
