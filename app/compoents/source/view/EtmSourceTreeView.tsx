// EtmSourceTreeView.tsx
import React, { useState } from "react";
import { Tree, Dropdown } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ISerializedSource, ISource, IXYZ } from "node_modules/openlayers-serializer/dist/dto/source";
import SourceModal from "./SourceModal";
type Props = {
  groupedSources: { [key: string]: ISource[] };
  onAddToMap?: (source: ISource) => void;
  onEdit?: (groupKey: string, source: ISource) => void;
  onDelete?: (id: string) => void;
  onAddNew?: (groupKey: string,source:ISource) => void;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<ISource | undefined>(undefined);
  const handleAddNew = (groupKey: string) => {
    setCurrentGroup(groupKey);
    setEditingSource(undefined);
    setModalVisible(true);
  };

  const handleEdit = (groupKey: string, source: ISource) => {
    setCurrentGroup(groupKey);
    setEditingSource(source);
    setModalVisible(true);
  };
  const treeData = Object.entries(groupedSources).map(([groupKey, items]) => ({
    title: (
      <Dropdown
        menu={{
          items: [
            { key: "addNew", label: t("dataSource.menu.addNew") },
            { key: "refresh", label: t("dataSource.menu.refresh") },
          ],
          onClick: ({ key }) => {
            if (key === "addNew") {
              handleAddNew(groupKey);
            } else if (key === "refresh") {
              onRefreshGroup?.(groupKey);
            }
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
                  
                  if (key === "add") {
                    debugger
                    onAddToMap?.(item);
                  } else
                    if (key === "edit") {
                      handleEdit(groupKey, item);
                    } else if (key === "delete") {
                      onDelete?.(item.id);
                    }
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
    <>
      <Tree
        rootStyle={{ height: "100%", overflow: "auto" }}
        showIcon
        defaultExpandAll
        treeData={treeData}
        selectable={false}
        style={{ height: "100%", padding: 8 }}
      />
      {currentGroup && (
        <SourceModal
          visible={modalVisible}
          source={editingSource}
          type={currentGroup}
          onOk={(source) => {
            if (editingSource) {
              onEdit?.(currentGroup, source);
            }
            else {
              onAddNew?.(currentGroup,source);
            }
            setModalVisible(false);
          }}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </>
  );
}
