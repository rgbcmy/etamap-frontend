import React from "react";
import { Modal, Form, Input, Select, InputNumber } from "antd";
import { useTranslation } from "react-i18next";

type NewMapModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (info: {
    name: string;
    projection: string;
    center: [number, number];
    zoom: number;
  }) => void;
};

export default function NewMapModal({ visible, onCancel, onConfirm }: NewMapModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onConfirm({
        name: values.name,
        projection: values.projection,
        center: [values.centerX, values.centerY],
        zoom: values.zoom
      });
    } catch (err) {
      // 表单校验失败
    }
  };

  return (
    <Modal
      title={t("newMap.title")}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={t("newMap.confirm")}
      cancelText={t("newMap.cancel")}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: t("newMap.defaultName"),
          projection: "EPSG:3857",
          centerX: 0,
          centerY: 0,
          zoom: 2
        }}
      >
        <Form.Item
          label={t("newMap.name")}
          name="name"
          rules={[{ required: true, message: t("newMap.nameRequired") }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t("newMap.projection")} name="projection">
          <Select
            options={[
              { value: "EPSG:3857", label: "EPSG:3857 (Web Mercator)" },
              { value: "EPSG:4326", label: "EPSG:4326 (WGS 84)" }
            ]}
          />
        </Form.Item>
        <Form.Item label={t("newMap.centerX")} name="centerX">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("newMap.centerY")} name="centerY">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label={t("newMap.zoom")} name="zoom">
          <InputNumber min={0} max={20} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
