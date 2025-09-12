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
  SaveOutlined,
  ExportOutlined,
  UndoOutlined,
  RedoOutlined,
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
      <div className="flex justify-between items-center px-3 h-12 bg-gray-100 ">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">Project</span>
          {/* 快捷操作按钮 */}
          <Tooltip title="Save">
            <Button type="text" icon={<SaveOutlined />} onClick={() => onAction("save")} />
          </Tooltip>
          <Tooltip title="Export">
            <Button type="text" icon={<ExportOutlined />} onClick={() => onAction("export")} />
          </Tooltip>
          <Tooltip title="Undo">
            <Button type="text" icon={<UndoOutlined />} onClick={() => onAction("undo")} />
          </Tooltip>
          <Tooltip title="Redo">
            <Button type="text" icon={<RedoOutlined />} onClick={() => onAction("redo")} />
          </Tooltip>
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
      }}></RibbonMenu>

    </div>
  );
}
