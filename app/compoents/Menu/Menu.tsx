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
  GlobalOutlined,
} from "@ant-design/icons";
import { RibbonMenu } from "./RibbonMenu";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

type RibbonMenuProps = {
  onAction: (type: string) => void;
  projectTitle: string;
};

export function Menu({ onAction,projectTitle }: RibbonMenuProps) {
  const { t } = useTranslation();
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
          {/* <span className="font-semibold text-sm">Project</span> */}
          {/* 快捷操作按钮 */}
          <div className="flex items-center gap-2">
          <span className="text-base font-semibold">{projectTitle}</span>
        </div>
          <Tooltip title={t("menu.save")}>
            <Button type="text" icon={<SaveOutlined />} onClick={() => onAction("save")} />
          </Tooltip>
          <Tooltip title={t("menu.export")}>
            <Button type="text" icon={<ExportOutlined />} onClick={() => onAction("export")} />
          </Tooltip>
          <Tooltip title={t("menu.undo")}>
            <Button type="text" icon={<UndoOutlined />} onClick={() => onAction("undo")} />
          </Tooltip>
          <Tooltip title={t("menu.redo")}>
            <Button type="text" icon={<RedoOutlined />} onClick={() => onAction("redo")} />
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <Tooltip title={t("menu.settings")}>
            <Button type="text" icon={<SettingOutlined />} onClick={() => onAction("settings")} />
          </Tooltip>
          <Tooltip title={t("menu.help")}>
            <Button type="text" icon={<QuestionCircleOutlined />} onClick={() => onAction("help")} />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: "zh", label: "中文" },
                { key: "en", label: "English" },
              ],
              onClick: ({ key }) => {
                i18n.changeLanguage(key);
                localStorage.setItem("lang", key);
              },
            }}
            trigger={["click"]}
          >
            {/* <Tooltip title={t("menu.language")}> */}
            <Button type="text" icon={<GlobalOutlined />}>
              {i18n.language === "zh" ? "中文" : "English"}
            </Button>
            {/* </Tooltip> */}
          </Dropdown>

        </div>
      </div>
      <RibbonMenu onAction={function (type: string): void {
        onAction(type);
        //throw new Error("Function not implemented.");
      }}></RibbonMenu>

    </div>
  );
}
