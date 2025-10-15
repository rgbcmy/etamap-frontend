import React, { useState } from "react";
import { Button, Checkbox, Col, Form, Input, InputNumber, message, Row, Select, Space, type FormInstance } from "antd";
import type { ITileWMS } from "node_modules/openlayers-serializer/dist/dto/source";
import TileGridForm from "./TileGridForm";
import ParamsJsonEditor from "./ParamsJsonEditor";

type Props = {
  form: FormInstance<ITileWMS>;
};

export default function SourceFormTileWMS({ form }: Props) {
  // ✅ OpenLayers 官方默认值
  const defaultValues: Partial<ITileWMS> = {
    projection: "EPSG:3857",
    attributionsCollapsible: true,
    gutter: 0,
    interpolate: true,
    hidpi: true,
    wrapX: true,
    reprojectionErrorThreshold: 0.5,
    zDirection: 0,
  };
  // 🔄 监听 hidpi 变化，用于动态禁用 serverType
  const hidpi = Form.useWatch("hidpi", form);
  const [useTileGrid, setUseTileGrid] = useState(false);
  // ✅ 提交逻辑：清理空 tileGrid
  return (
    <>
      <Form.Item
        name="url"
        label="WMS 服务 URL (url)"
        rules={[{ required: true, message: "请输入 WMS URL" }]}
      >
        <Input placeholder="https://example.com/geoserver/wms" />
      </Form.Item>

      <Form.Item
        name="urls"
        label="备用 URLs (urls)"
      >
        <Select
          mode="tags"
          tokenSeparators={[",", "\n"]}
          placeholder="多个 URL 用逗号或换行分隔"
        />
      </Form.Item>

      <Form form={form} layout="vertical">
        <Form.Item label="WMS 参数 (params)" name="params">
          <ParamsJsonEditor />
        </Form.Item>
      </Form>

      <Form.Item
        name="projection"
        label="投影 (projection)"
        initialValue={defaultValues.projection}
      >
        <Input placeholder="EPSG:3857 或其他" />
      </Form.Item>

      <Row gutter={8}>
        <Col span={12}>
          <Form.Item
            name="gutter"
            label="gutter"
            initialValue={defaultValues.gutter}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="reprojectionErrorThreshold"
            label="reprojectionErrorThreshold"
            initialValue={defaultValues.reprojectionErrorThreshold}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      {/* <Form.Item
        name="cacheSize"
        label="cacheSize"
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item> */}

      <Form.Item
        name="tileClass"
        label="tileClass"
      >
        <Input placeholder="自定义瓦片类 (ImageTile 子类)" />
      </Form.Item>
      <Form.Item
        name="crossOrigin"
        label="crossOrigin"
      >
        <Input placeholder="anonymous / use-credentials / null" />
      </Form.Item>

      <Form.Item
        name="interpolate"
        valuePropName="checked"
        initialValue={defaultValues.interpolate}
      >
        <Checkbox>interpolate (重采样插值)</Checkbox>
      </Form.Item>

      <Form.Item
        name="hidpi"
        valuePropName="checked"
        initialValue={defaultValues.hidpi}
      >
        <Checkbox>hidpi (高分屏支持)</Checkbox>
      </Form.Item>
      <Form.Item
        name="serverType"
        label="服务器类型 (serverType)"
        tooltip="仅在 hidpi = true 时需要设置"
      >
        <Select
          allowClear
          disabled={!hidpi}
          placeholder={hidpi ? "请选择服务器类型" : "禁用（hidpi=false）"}
          options={[
            { label: "GeoServer", value: "geoserver" },
            { label: "MapServer", value: "mapserver" },
            { label: "Carmenta Server", value: "carmentaserver" },
            { label: "QGIS Server", value: "qgis" },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="wrapX"
        valuePropName="checked"
        initialValue={defaultValues.wrapX}
      >
        <Checkbox>wrapX (水平重复世界)</Checkbox>
      </Form.Item>

      <Form.Item
        name="attributions"
        label="数据来源 (attributions)"
      >
        <Select mode="tags" tokenSeparators={[",", "\n"]} placeholder="输入 attribution" />
      </Form.Item>

      <Form.Item
        name="attributionsCollapsible"
        valuePropName="checked"
        initialValue={defaultValues.attributionsCollapsible}
      >
        <Checkbox>attributionsCollapsible</Checkbox>
      </Form.Item>

      <Form.Item
        name="transition"
        label="transition (ms)"
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="zDirection"
        label="zDirection"
        initialValue={defaultValues.zDirection}
      >
        <InputNumber min={-1} max={1} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="tileLoadFunction"
        label="tileLoadFunction"
      >
        <Input.TextArea placeholder="自定义加载函数 (脚本或函数名)" rows={2} />
      </Form.Item>

      {/* ✅ 可选 TileGrid 部分 */}
      <Form.Item label="TileGrid 设置">
        <Checkbox
          checked={useTileGrid}
          onChange={(e) => setUseTileGrid(e.target.checked)}
        >
          启用自定义 TileGrid
        </Checkbox>
      </Form.Item>

      {useTileGrid && (
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <TileGridForm name="tileGrid" />
        </div>
      )}
    </>
  );
}
