import { Dropdown, Menu, Tabs } from "antd";
import { RibbonGroup } from "./RibbonGroup";
import { RibbonButton } from "./RibbonButton";
import { AimOutlined, AreaChartOutlined, DeleteOutlined, EyeOutlined, FileOutlined, FileSearchOutlined, FolderAddOutlined, GlobalOutlined, LineOutlined, MinusSquareOutlined, PlusSquareOutlined, ScissorOutlined, SelectOutlined, SettingOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";

export const RibbonMenu: React.FC<{ onAction: (type: string) => void }> = ({ onAction }) => {
  const [activeKey, setActiveKey] = useState("home");
  const fileDropdownRef = useRef<HTMLDivElement>(null);
  // File Dropdown Menu
  const fileMenu = (
    <Menu
      items={[
        { key: "new", label: "New", onClick: () => onAction("new-file") },
        { key: "open", label: "Open", onClick: () => onAction("open-file") },
        { key: "save", label: "Save", onClick: () => onAction("save-file") },
        { key: "saveAs", label: "Save As", onClick: () => onAction("save-as-file") },
        { type: "divider" },
        { key: "exit", label: "Exit", onClick: () => onAction("exit") },
      ]}
    />
  );
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
            onClick: (key: any) => onAction(`basemap-${key}`),
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
      activeKey={activeKey} // 受控
      defaultActiveKey="home"
      items={[
        {
          key: "file",
          label: (
            <Dropdown overlay={fileMenu} placement="bottomLeft" trigger={['click']}>
              <span style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <FileOutlined style={{ marginRight: 4 }} /> File
              </span>
            </Dropdown>
          ),
          children: <div></div>, // 空内容
        },
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
      onTabClick={(key) => {
        if (key === "file") {
          debugger
          // 阻止切换，同时打开下拉菜单
          const dom = document.getElementById("file-dropdown-trigger");
          dom?.click();
        } else {
          setActiveKey(key); // 只有非 File Tab 才切换
        }
      }}
    >
      {/* 隐藏的 Dropdown，用于触发 File 菜单 */}
      <Dropdown
        overlay={fileMenu}
        trigger={['click']}
        getPopupContainer={() => document.body}
      >
        <span id="file-dropdown-trigger" style={{ display: "none" }}></span>
      </Dropdown>
    </Tabs>
  );
};
