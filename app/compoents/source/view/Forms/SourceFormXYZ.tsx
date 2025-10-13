import React from "react";
import { Form, Input, InputNumber, Checkbox, Row, Col, Select, Space } from "antd";
import type { FormInstance } from "antd";
import type { IXYZ } from "node_modules/openlayers-serializer/dist/dto/source";
type Props = {
    form: FormInstance<IXYZ>;
};

export default function SourceFormXYZ({ form }: Props) {
    // ✅ OpenLayers 官方默认值
    const defaultValues: Partial<IXYZ> = {
        projection: "EPSG:3857",
        attributionsCollapsible: true,
        gutter: 0,
        interpolate: true,
        opaque: false,
        maxZoom: 42,
        minZoom: 0,
        reprojectionErrorThreshold: 0.5,
        tilePixelRatio: 1,
        tileSize: [256, 256],
        transition: 250,
        wrapX: true,
        zDirection: 0,
    };
    return (
        <>
            {/* 基本 URL(s) */}
            <Form.Item
                name="url"
                label="URL"
                rules={[{ required: false, message: "请输入瓦片 URL" }]}
            >
                <Input placeholder="http://example.com/tiles/{z}/{x}/{y}.png" />
            </Form.Item>

            <Form.Item name="urls" label="备用 URLs">
                <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    tokenSeparators={[",", "\n"]}
                    placeholder="多个 URL 用回车或逗号分隔"
                />
            </Form.Item>

            {/* 常用设置 */}
            <Form.Item name="projection" label="投影 (projection)" initialValue={defaultValues.projection}>
                <Input placeholder="EPSG:3857" />
            </Form.Item>

            <Row gutter={8}>
                <Col span={12}>
                    <Form.Item name="minZoom" label="最小缩放等级 (minZoom)" initialValue={defaultValues.minZoom}>
                        <InputNumber min={0} max={42} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="maxZoom" label="最大缩放等级 (maxZoom)" initialValue={defaultValues.maxZoom}>
                        <InputNumber min={0} max={42} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="maxResolution" label="最大分辨率 (maxResolution)">
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            {/* tileSize：支持输入 "256,256" 或 JSON [256,256] */}
            <Form.Item label="瓦片大小 (tileSize)">
                <Space.Compact block>
                    <Form.Item name={["tileSize", 0]} noStyle initialValue={defaultValues.tileSize?.[0]}>
                        <InputNumber min={1} placeholder="宽度" style={{ width: "50%" }} />
                    </Form.Item>
                    <Form.Item name={["tileSize", 1]} noStyle initialValue={defaultValues.tileSize?.[1]}>
                        <InputNumber min={1} placeholder="高度" style={{ width: "50%" }} />
                    </Form.Item>
                </Space.Compact>
            </Form.Item>

            <Form.Item name="tilePixelRatio" label="tilePixelRatio" initialValue={defaultValues.tilePixelRatio}>
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            {/**使用默认的自动增长，不设置 */}
            {/* <Form.Item name="cacheSize" label="cacheSize">
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item> */}

            <Form.Item name="crossOrigin" label="crossOrigin">
                <Input placeholder="anonymous / use-credentials" />
            </Form.Item>

            <Form.Item name="opaque" valuePropName="checked" initialValue={defaultValues.opaque}>
                <Checkbox>opaque</Checkbox>
            </Form.Item>

            <Form.Item name="wrapX" valuePropName="checked" initialValue={defaultValues.wrapX}>
                <Checkbox>wrapX</Checkbox>
            </Form.Item>

            <Form.Item name="interpolate" valuePropName="checked" initialValue={defaultValues.interpolate}>
                <Checkbox>interpolate</Checkbox>
            </Form.Item>

            <Form.Item name="transition" label="transition (ms)" initialValue={defaultValues.transition}>
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="zDirection" label="zDirection" initialValue={defaultValues.zDirection}>
                <InputNumber min={-1} max={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="gutter" label="gutter" initialValue={defaultValues.gutter}>
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="reprojectionErrorThreshold" label="reprojectionErrorThreshold" initialValue={defaultValues.reprojectionErrorThreshold}>
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            {/* 复杂/高级字段，允许 JSON 文本或字符串 */}
            <Form.Item name="tileGrid" label="tileGrid (JSON)">
                <Input.TextArea placeholder='例如：{"tileSize":256,"extent":[...]} 或 空' rows={3} />
            </Form.Item>

            <Form.Item name="tileLoadFunction" label="tileLoadFunction (字符串)">
                <Input.TextArea placeholder="可以是函数名或脚本字符串（按需处理）" rows={2} />
            </Form.Item>

            <Form.Item name="tileUrlFunction" label="tileUrlFunction (字符串)">
                <Input.TextArea placeholder="可以是函数名或模板" rows={2} />
            </Form.Item>

            {/* attribution / state 等 */}
            <Form.Item name="attributions" label="数据来源 (Attributions)">
                <Select
                    mode="tags"
                    tokenSeparators={[",", "\n"]}
                    placeholder="输入多个数据来源后按回车"
                />
            </Form.Item>

            <Form.Item name="attributionsCollapsible" valuePropName="checked" initialValue={defaultValues.attributionsCollapsible}>
                <Checkbox>attributionsCollapsible</Checkbox>
            </Form.Item>

            <Form.Item name="state" label="state">
                <Input placeholder="例如 'ready' / 'loading' / null" />
            </Form.Item>

            {/* name/id 通常在上层处理，但仍可编辑 */}
            {/* <Form.Item name="id" label="ID">
        <Input placeholder="可选：手动设置 id" />
      </Form.Item> */}

            <Form.Item name="urlTemplate" label="备用 urlTemplate（自定义字段）" hidden>
                <Input />
            </Form.Item>
        </>
    );
}
