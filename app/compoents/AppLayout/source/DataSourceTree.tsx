import React from "react";
import { Tree, Dropdown, Menu } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

type DataSource = {
  id: string;
  name: string;
  type: "XYZ";
  url: string;
};

type Props = {
  sources: DataSource[];
  onAddToMap?: (source: DataSource) => void;
  onEdit?: (source: DataSource) => void;
  onDelete?: (id: string) => void;
  onAddNew?: (groupKey: string) => void;
  onRefreshGroup?: (groupKey: string) => void;
};

export default function DataSourceTree({
  sources,
  onAddToMap,
  onEdit,
  onDelete,
  onAddNew,
  onRefreshGroup
}: Props) {
  const { t } = useTranslation();

  const xyzSources = sources.filter(s => s.type === "XYZ");

  const renderLeafTitle = (item: DataSource) => {
    const menu = (
      <Menu>
        <Menu.Item key="add" onClick={() => onAddToMap?.(item)}>
          {t("dataSource.menu.addToMap")}
        </Menu.Item>
        <Menu.Item key="edit" onClick={() => onEdit?.(item)}>
          {t("dataSource.menu.edit")}
        </Menu.Item>
        <Menu.Item key="delete" danger onClick={() => onDelete?.(item.id)}>
          {t("dataSource.menu.delete")}
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu} trigger={["contextMenu"]}>
        <span>{item.name}</span>
      </Dropdown>
    );
  };

  const renderGroupTitle = (groupKey: string) => {
    const menu = (
      <Menu>
        <Menu.Item key="addNew" onClick={() => onAddNew?.(groupKey)}>
          {t("dataSource.menu.addNew")}
        </Menu.Item>
        <Menu.Item key="refresh" onClick={() => onRefreshGroup?.(groupKey)}>
          {t("dataSource.menu.refresh")}
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu} trigger={["contextMenu"]}>
        <span>{t(`dataSource.groupTitle.${groupKey}`)}</span>
      </Dropdown>
    );
  };

  const treeData = [
    {
      title: renderGroupTitle("xyz"),
      key: "xyz-group",
      icon: <FolderOpenOutlined />,
      children: xyzSources.length > 0
        ? xyzSources.map(item => ({
            title: renderLeafTitle(item),
            key: item.id,
            icon: <FileOutlined />,
            isLeaf: true
          }))
        : [
            {
              title: t("dataSource.node.empty"),
              key: "xyz-empty",
              disabled: true,
              icon: <FileOutlined />,
              isLeaf: true
            }
          ]
    }
  ];

  return (
      <Tree
        rootStyle={{ height: "100%", overflow: "auto" }}
        showIcon
        defaultExpandAll
        treeData={treeData}
        selectable={false}
        style={{ height: "100%", padding: 8 }}
      />
  );
}
