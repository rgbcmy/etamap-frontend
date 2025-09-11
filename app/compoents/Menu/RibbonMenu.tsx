import { Tabs } from "antd";
import { RibbonGroup } from "./RibbonGroup";
import { RibbonButton } from "./RibbonButton";
import { AimOutlined, AreaChartOutlined, DeleteOutlined, EyeOutlined, FileSearchOutlined, FolderAddOutlined, GlobalOutlined, LineOutlined, MinusSquareOutlined, PlusSquareOutlined, ScissorOutlined, SelectOutlined, SettingOutlined } from "@ant-design/icons";

export const RibbonMenu: React.FC<{ onAction: (type: string) => void }> = ({ onAction }) => {

// Home Tab
const homeTab = (
  <div className="flex h-24 items-end gap-2 px-2">
    <RibbonGroup title="Layer">
      <RibbonButton
        size="large"
        icon={<FolderAddOutlined />}
        label="Add Data"
        onClick={() => onAction("add-layer")}
      />
      <RibbonButton
        size="small"
        icon={<DeleteOutlined />}
        label="Remove"
        onClick={() => onAction("remove-layer")}
      />
      <RibbonButton
        size="small"
        type="toggle"
        icon={<EyeOutlined />}
        label="Visibility"
        onClick={() => onAction("toggle-visibility")}
      />
    </RibbonGroup>

    <RibbonGroup title="Clipboard">
      <RibbonButton
        size="large"
        icon={<ScissorOutlined />}
        label="Cut"
        onClick={() => onAction("cut")}
      />
      <RibbonButton
        size="small"
        icon={<PlusSquareOutlined />}
        label="Copy"
        onClick={() => onAction("copy")}
      />
      <RibbonButton
        size="small"
        icon={<MinusSquareOutlined />}
        label="Paste"
        onClick={() => onAction("paste")}
      />
    </RibbonGroup>
  </div>
);

// Map Tab
const mapTab = (
  <div className="flex h-24 items-end gap-2 px-2">
    <RibbonGroup title="Navigation">
      <RibbonButton
        size="large"
        icon={<AimOutlined />}
        label="Zoom To Layer"
        onClick={() => onAction("zoom-to-layer")}
      />
      <RibbonButton
        size="small"
        icon={<GlobalOutlined />}
        label="Full Extent"
        onClick={() => onAction("full-extent")}
      />
      <RibbonButton
        size="small"
        icon={<SelectOutlined />}
        label="Select"
        onClick={() => onAction("select")}
      />
    </RibbonGroup>

    <RibbonGroup title="Basemap">
      <RibbonButton
        size="large"
        type="dropdown"
        icon={<SettingOutlined />}
        label="Basemap"
        menu={{
          items: [
            { key: "osm", label: "OpenStreetMap" },
            { key: "satellite", label: "Satellite" },
            { key: "topo", label: "Topographic" },
          ],
          onClick: (key:any) => onAction(`basemap-${key}`),
        }}
      />
    </RibbonGroup>
  </div>
);

// Analysis Tab
const analysisTab = (
  <div className="flex h-24 items-end gap-2 px-2">
    <RibbonGroup title="Tools">
      <RibbonButton
        size="large"
        icon={<FileSearchOutlined />}
        label="Geoprocessing"
        onClick={() => onAction("geoprocessing")}
      />
      <RibbonButton
        size="small"
        icon={<LineOutlined />}
        label="Buffer"
        onClick={() => onAction("buffer")}
      />
      <RibbonButton
        size="small"
        icon={<AreaChartOutlined />}
        label="Overlay"
        onClick={() => onAction("overlay")}
      />
    </RibbonGroup>
  </div>
);

// Tabs
const ribbonTabs = [
  { key: "home", label: "Home", children: homeTab },
  { key: "map", label: "Map", children: mapTab },
  { key: "analysis", label: "Analysis", children: analysisTab },
];

  return (
    <Tabs
      defaultActiveKey="home"
      items={[
        { key: "home", label: "Home", children: homeTab },
        { key: "map", label: "Map", children: mapTab },
        { key: "analysis", label: "Analysis", children: analysisTab },
      ]}
      tabBarStyle={{
        margin: 0,
        background: "#f0f0f0",
        borderBottom: "1px solid #d9d9d9",
        height: 36,
        lineHeight: "36px",
        padding: "0 12px",
      }}
    />
  );
};
