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
  SearchOutlined,
  RadiusSettingOutlined,
} from "@ant-design/icons";
import { RibbonMenu } from "./RibbonMenu";

type RibbonMenuProps = {
  onAction: (type: string) => void;
};

export function Menu({ onAction }: RibbonMenuProps) {
  const menu = {
    items: [
      { key: "expand-all", label: <span><PlusSquareOutlined /> Expand All</span> },
      { key: "collapse-all", label: <span><MinusSquareOutlined /> Collapse All</span> },
    ],
    onClick: ({ key }: { key: string }) => onAction(key),
  };

// Ribbon 工具组

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
      <RibbonMenu onAction={function (type: string): void {
        throw new Error("Function not implemented.");
      } }></RibbonMenu>

    </div>
  );
}
