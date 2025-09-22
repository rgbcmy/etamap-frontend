import React from "react";
import { Tree, Dropdown, Menu } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n";

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
    const menu = {
      items: [
        { key: "add", label: t("dataSource.menu.addToMap") },
        { key: "edit", label: t("dataSource.menu.edit") },
        { key: "delete", label: t("dataSource.menu.delete") },
      ],
      onClick: ({ key }: { key: string }) => {
        switch (key) {
          case "add":
            onAddToMap?.(item)
            break;
          case "edit":
            onEdit?.(item)
            break;
          case "delete":
            onDelete?.(item.id)
            break;
          default:
            break;
        }
      },
    }

    // (
    //   <Menu>
    //     <Menu.Item key="add" onClick={() => onAddToMap?.(item)}>
    //       {t("dataSource.menu.addToMap")}
    //     </Menu.Item>
    //     <Menu.Item key="edit" onClick={() => onEdit?.(item)}>
    //       {t("dataSource.menu.edit")}
    //     </Menu.Item>
    //     <Menu.Item key="delete" danger onClick={() => onDelete?.(item.id)}>
    //       {t("dataSource.menu.delete")}
    //     </Menu.Item>
    //   </Menu>
    // );
    return (
      <Dropdown menu={menu} trigger={["contextMenu"]}>
        <span>{item.name}</span>
      </Dropdown>
    );
  };

  const renderGroupTitle = (groupKey: string) => {
    const menu ={
      items: [
        { key: "addNew", label: t("dataSource.menu.addToMap") },
        { key: "refresh", label: t("dataSource.menu.edit") },
      ],
      onClick: ({ key }: { key: string }) => {
        switch (key) {
          case "add":
            onAddNew?.(groupKey)
            break;
          case "edit":
            onRefreshGroup?.(groupKey)
            break;
          default:
            break;
        }
      },
    }
    return (
      <Dropdown menu={menu} trigger={["contextMenu"]}>
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
