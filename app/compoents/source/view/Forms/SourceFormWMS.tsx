import React from "react";
import { Form, Input } from "antd";

type Props = {
  form: any;
};

export default function SourceFormWMS({ form }: Props) {
  return (
    <>
      <Form.Item
        name="url"
        label="WMS URL"
        rules={[{ required: true, message: "请输入 WMS URL" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="layers"
        label="图层"
        rules={[{ required: true, message: "请输入图层名称" }]}
      >
        <Input />
      </Form.Item>
    </>
  );
}
