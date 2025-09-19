import React, { useState } from "react";
import { Modal, Button, Table, Form, Input, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

type DataSource = {
  id: string;
  name: string;
  type: "GeoJSON" | "WMS" | "XYZ";
  url?: string;
};

export default function DataSourceManagerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setEditingSource(null);
    setFormVisible(true);
  };

  const handleEdit = (source: DataSource) => {
    form.setFieldsValue(source);
    setEditingSource(source);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newSource: DataSource = {
        id: editingSource?.id || Date.now().toString(),
        ...values
      };
      setSources(prev => {
        const updated = editingSource
          ? prev.map(s => (s.id === editingSource.id ? newSource : s))
          : [...prev, newSource];
        return updated;
      });
      setFormVisible(false);
      message.success(t("dataSource.saved"));
    } catch (err) {
      // 校验失败
    }
  };

  return (
    <Modal
      title={t("dataSource.managerTitle")}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <strong>{t("dataSource.listTitle")}</strong>
        <Button icon={<PlusOutlined />} onClick={handleAdd}>
          {t("dataSource.add")}
        </Button>
      </div>
      <Table
        size="small"
        rowKey="id"
        dataSource={sources}
        pagination={false}
        columns={[
          { title: t("dataSource.name"), dataIndex: "name" },
          {
            title: t("dataSource.actions"),
            render: (_, record) => (
              <>
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
              </>
            )
          }
        ]}
      />
      <Modal
        title={editingSource ? t("dataSource.edit") : t("dataSource.add")}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label={t("dataSource.name")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label={t("dataSource.type")} rules={[{ required: true }]}>
            <Select
              options={[
                { value: "GeoJSON", label: "GeoJSON" },
                { value: "WMS", label: "WMS" },
                { value: "XYZ", label: "XYZ" }
              ]}
            />
          </Form.Item>
          <Form.Item name="url" label={t("dataSource.url")}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
}
