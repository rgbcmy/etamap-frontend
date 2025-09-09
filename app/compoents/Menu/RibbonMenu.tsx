import React from "react";
import { Tabs, Button, Tooltip, Dropdown, Space } from "antd";
import {
  FolderAddOutlined,
  EyeOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
  DeleteOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

type RibbonMenuProps = {
  onAction: (type: string) => void;
};

export function RibbonMenu({ onAction }: RibbonMenuProps) {
  const menu = {
    items: [
      { key: "expand-all", label: <span><PlusSquareOutlined /> Expand All</span> },
      { key: "collapse-all", label: <span><MinusSquareOutlined /> Collapse All</span> },
    ],
    onClick: ({ key }: { key: string }) => onAction(key),
  };

  // Ribbon 工具组
  const homeTab = (
    <div className="flex flex-wrap gap-1 p-1">
      <Tooltip title="Add Group">
        <Button type="text" icon={<FolderAddOutlined />} onClick={() => onAction("add-group")} />
      </Tooltip>

      <Tooltip title="Manage Map Themes">
        <Dropdown menu={menu} trigger={["click"]}>
          <Button type="text" icon={<EyeOutlined />} />
        </Dropdown>
      </Tooltip>

      <Tooltip title="Expand All">
        <Button type="text" icon={<PlusSquareOutlined />} onClick={() => onAction("expand-all")} />
      </Tooltip>

      <Tooltip title="Collapse All">
        <Button type="text" icon={<MinusSquareOutlined />} onClick={() => onAction("collapse-all")} />
      </Tooltip>

      <Tooltip title="Remove Layer/Group">
        <Button type="text" icon={<DeleteOutlined />} onClick={() => onAction("remove")} />
      </Tooltip>
    </div>
  );

  return (
    <div className="ribbon-menu w-full">
      {/* 顶部 Header */}
      <div className="flex justify-between items-center px-3 h-12 bg-gray-100 border-b">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">Project</span>
        </div>
        <div className="flex gap-2">
          <Tooltip title="Settings">
            <Button type="text" icon={<SettingOutlined />} onClick={() => onAction("settings")} />
          </Tooltip>
          <Tooltip title="Help">
            <Button type="text" icon={<QuestionCircleOutlined />} onClick={() => onAction("help")} />
          </Tooltip>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <Tabs
        defaultActiveKey="home"
        items={[
          { key: "home", label: "Home", children: homeTab },
          { key: "map", label: "Map", children: <div className="p-2 flex flex-wrap gap-1">Map tools</div> },
          { key: "insert", label: "Insert", children: <div className="p-2 flex flex-wrap gap-1">Insert tools</div> },
          { key: "analysis", label: "Analysis", children: <div className="p-2 flex flex-wrap gap-1">Analysis tools</div> },
        ]}
        tabBarStyle={{
          margin: 0,
          background: '#f0f0f0',
          borderBottom: '1px solid #d9d9d9',
          height: 36,
          lineHeight: '36px',
          padding: '0 12px',
        }}
      />
    </div>
  );
}
