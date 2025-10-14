import React from "react";
import { Form, Input, InputNumber, Button, Space, Checkbox } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import type { ITileGrid } from "node_modules/openlayers-serializer/dist/dto/source";
import type { FormInstance } from "antd";

type Props = {
  form?: FormInstance<ITileGrid>;
  name?: string;
  label?: string;
};

export default function TileGridForm({ name = "tileGrid", label = "TileGrid 设置" }: Props) {
  return (
    <Form.Item
      label={label}
      style={{
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* extent */}
        <Form.Item name={[name, "extent"]} label="范围 (extent)">
          <Input placeholder="[minX, minY, maxX, maxY]" />
        </Form.Item>

        {/* origin */}
        <Form.Item name={[name, "origin"]} label="原点 (origin)">
          <Input placeholder="[x, y]" />
        </Form.Item>

        {/* origins */}
        <Form.List name={[name, "origins"]}>
          {(fields, { add, remove }) => (
            <>
              <label>多级原点 (origins)</label>
              {fields.map(({ key, name: fieldName }) => (
                <Space key={key} align="baseline" style={{ display: "flex" }}>
                  <Form.Item name={fieldName} noStyle>
                    <Input placeholder="[x, y]" style={{ width: 300 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                添加原点
              </Button>
            </>
          )}
        </Form.List>

        {/* resolutions */}
        <Form.Item name={[name, "resolutions"]} label="分辨率数组 (resolutions)">
          <Input placeholder="[156543.03, 78271.51, 39135.76, ...]" />
        </Form.Item>

        {/* sizes */}
        <Form.List name={[name, "sizes"]}>
          {(fields, { add, remove }) => (
            <>
              <label>每级瓦片数量 (sizes)</label>
              {fields.map(({ key, name: fieldName }) => (
                <Space key={key} align="baseline">
                  <Form.Item name={fieldName} noStyle>
                    <Input placeholder="[cols, rows]" style={{ width: 300 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                添加瓦片数量
              </Button>
            </>
          )}
        </Form.List>

        {/* tileSize */}
        <Form.Item name={[name, "tileSize"]} label="瓦片大小 (tileSize)">
          <Input placeholder="256 或 [256,256]" />
        </Form.Item>

        {/* tileSizes */}
        <Form.List name={[name, "tileSizes"]}>
          {(fields, { add, remove }) => (
            <>
              <label>多级瓦片大小 (tileSizes)</label>
              {fields.map(({ key, name: fieldName }) => (
                <Space key={key} align="baseline">
                  <Form.Item name={fieldName} noStyle>
                    <Input placeholder="[256,256]" style={{ width: 300 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(fieldName)} />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                添加瓦片大小
              </Button>
            </>
          )}
        </Form.List>

        {/* minZoom */}
        <Form.Item name={[name, "minZoom"]} label="最小缩放等级 (minZoom)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Space>
    </Form.Item>
  );
}
