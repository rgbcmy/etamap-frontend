import { Dropdown, Menu, Tabs, type MenuProps } from "antd";
import { RibbonGroup } from "./RibbonGroup";
import { RibbonButton } from "./RibbonButton";
import { AimOutlined, AreaChartOutlined, DeleteOutlined, EyeOutlined, FileOutlined, FileSearchOutlined, FolderAddOutlined, GlobalOutlined, LineOutlined, MinusSquareOutlined, PlusSquareOutlined, ScissorOutlined, SelectOutlined, SettingOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
export const RibbonMenu: React.FC<{ onAction: (type: string) => void }> = ({ onAction }) => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState("home");
  const fileDropdownRef = useRef<HTMLDivElement>(null);
  // File Dropdown Menu
  const fileMenu: MenuProps = {
    items: [
      { key: "new", label: t("file.new") },
      { key: "open", label: t("file.open") },
      { key: "save", label: t("file.save") },
      { key: "saveAs", label: t("file.saveAs") },
      { type: "divider" },
      // { key: "exit", label: t("file.exit") },
    ],
    onClick: ({ key }: { key: string }) => {
      debugger
      switch (key) {
        case "new": onAction("newFile"); break;
        case "open": onAction("openFile"); break;
        case "save": onAction("saveFile"); break;
        case "saveAs": onAction("saveAsFile"); break;
        case "exit": onAction("exit"); break;
      }
    },
  };
  // Home Tab
  const homeTab = (
    <div className="flex h-24 items-end gap-2 px-2">
      <RibbonGroup title={t("group.layer")}>
        <RibbonButton
          size="large"
          icon={<FolderAddOutlined />}
          label={t("layer.addData")}
          onClick={() => onAction("add-layer")}
        />
        <RibbonButton
          size="small"
          icon={<DeleteOutlined />}
          label={t("layer.remove")}
          onClick={() => onAction("remove-layer")}
        />
        <RibbonButton
          size="small"
          type="toggle"
          icon={<EyeOutlined />}
          label={t("layer.visibility")}
          onClick={() => onAction("toggle-visibility")}
        />
      </RibbonGroup>

      <RibbonGroup  title={t("group.clipboard")}>
        <RibbonButton
          size="large"
          icon={<ScissorOutlined />}
          label={t("clipboard.cut")}
          onClick={() => onAction("cut")}
        />
        <RibbonButton
          size="small"
          icon={<PlusSquareOutlined />}
          label={t("clipboard.copy")}
          onClick={() => onAction("copy")}
        />
        <RibbonButton
          size="small"
          icon={<MinusSquareOutlined />}
          label={t("clipboard.paste")}
          onClick={() => onAction("paste")}
        />
      </RibbonGroup>
    </div>
  );

  // Map Tab
  const mapTab = (
    <div className="flex h-24 items-end gap-2 px-2">
      <RibbonGroup title={t("group.navigation")}>
        <RibbonButton
          size="large"
          icon={<AimOutlined />}
          label={t("navigation.zoomToLayer")}
          onClick={() => onAction("zoom-to-layer")}
        />
        <RibbonButton
          size="small"
          icon={<GlobalOutlined />}
          label={t("navigation.fullExtent")}
          onClick={() => onAction("full-extent")}
        />
        <RibbonButton
          size="small"
          icon={<SelectOutlined />}
          label={t("navigation.select")}
          onClick={() => onAction("select")}
        />
      </RibbonGroup>

      <RibbonGroup title={t("group.basemap")}>
        <RibbonButton
          size="large"
          type="dropdown"
          icon={<SettingOutlined />}
          label={t("basemap.title")}
          menu={{
            items: [
              { key: "osm", label: t("basemap.osm") },
              { key: "satellite", label: t("basemap.satellite") },
              { key: "topo", label: t("basemap.topo") },
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
      <RibbonGroup title={t("group.tools")}>
        <RibbonButton
          size="large"
          icon={<FileSearchOutlined />}
          label={t("tools.geoprocessing")}
          onClick={() => onAction("geoprocessing")}
        />
        <RibbonButton
          size="small"
          icon={<LineOutlined />}
          label={t("tools.buffer")}
          onClick={() => onAction("buffer")}
        />
        <RibbonButton
          size="small"
          icon={<AreaChartOutlined />}
          label={t("tools.overlay")}
          onClick={() => onAction("overlay")}
        />
      </RibbonGroup>
    </div>
  );

  // Tabs
  const ribbonTabs = [
    { key: "home", label: t("tab.home"), children: homeTab },
    { key: "map", label: t("tab.map"), children: mapTab },
    { key: "analysis", llabel: t("tab.analysis"), children: analysisTab },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeKey} // 受控
        defaultActiveKey="home"
        items={[
          {
            key: "file",
            label: (
              <Dropdown menu={fileMenu} placement="bottomLeft" trigger={['click']}>
                <span style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <FileOutlined style={{ marginRight: 4 }} /> {t("tab.file")}
                </span>
              </Dropdown>
            ),
            children: <div></div>, // 空内容
          },
          { key: "home", label: t("tab.home"), children: homeTab },
          { key: "map", label: t("tab.map"), children: mapTab },
          { key: "analysis", label: t("tab.analysis"), children: analysisTab },
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
            // 第一个tab不触发tab选择
          } else {
            setActiveKey(key); // 只有非 File Tab 才切换
          }
        }}
      >
      </Tabs>
      {/* 隐藏的 Dropdown，用于触发 File 菜单 */}
      <Dropdown
        menu={fileMenu}
        trigger={['click']}
        getPopupContainer={() => document.body}
      >
        <span id="file-dropdown-trigger" style={{ display: "none" }}></span>
      </Dropdown>
    </div>

  );
};
