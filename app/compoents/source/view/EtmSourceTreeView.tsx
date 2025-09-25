// EtmSourceTreeView.tsx
import React from "react";
import { Tree, Dropdown } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ISerializedSource,ISource, IXYZ} from "node_modules/openlayers-serializer/dist/dto/source";

type Props = {
  groupedSources: { [key: string]: ISource[] };
  onAddToMap?: (source: ISource) => void;
  onEdit?: (source: ISource) => void;
  onDelete?: (id: string) => void;
  onAddNew?: (groupKey: string) => void;
  onRefreshGroup?: (groupKey: string) => void;
};

export default function EtmSourceTreeView({
  groupedSources,
  onAddToMap,
  onEdit,
  onDelete,
  onAddNew,
  onRefreshGroup,
}: Props) {
  const { t } = useTranslation();

  const treeData = Object.entries(groupedSources).map(([groupKey, items]) => ({
    title: (
      <Dropdown
        menu={{
          items: [
            { key: "addNew", label: t("dataSource.menu.addNew") },
            { key: "refresh", label: t("dataSource.menu.refresh") },
          ],
          onClick: ({ key }) => {
            if (key === "addNew") onAddNew?.(groupKey);
            if (key === "refresh") onRefreshGroup?.(groupKey);
          },
        }}
        trigger={["contextMenu"]}
      >
        <span>{t(`dataSource.groupTitle.${groupKey}`)}</span>
      </Dropdown>
    ),
    key: `${groupKey}-group`,
    icon: <FolderOpenOutlined />,
    children:
      items.length > 0
        ? items.map((item) => ({
            title: (
              <Dropdown
                menu={{
                  items: [
                    { key: "add", label: t("dataSource.menu.addToMap") },
                    { key: "edit", label: t("dataSource.menu.edit") },
                    { key: "delete", label: t("dataSource.menu.delete") },
                  ],
                  onClick: ({ key }) => {
                    if (key === "add") onAddToMap?.(item);
                    if (key === "edit") onEdit?.(item);
                    if (key === "delete") onDelete?.(item.id);
                  },
                }}
                trigger={["contextMenu"]}
              >
                <span>{item.name}</span>
              </Dropdown>
            ),
            key: item.id,
            icon: <FileOutlined />,
            isLeaf: true,
          }))
        : [
            {
              title: t("dataSource.node.empty"),
              key: `${groupKey}-empty`,
              disabled: true,
              icon: <FileOutlined />,
              isLeaf: true,
            },
          ],
  }));

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
