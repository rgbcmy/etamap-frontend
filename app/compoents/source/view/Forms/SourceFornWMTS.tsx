import React, { useState } from "react";
import { Form, Input, Select, Checkbox, Button, message } from "antd";
import { WMTSCapabilities } from "ol/format";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import type { FormInstance } from "antd";
import type { IWMTS, IWMTSTileGrid } from "node_modules/openlayers-serializer/dist/dto/source";
import { serializeSource } from "openlayers-serializer";

type Props = {
    form: FormInstance<IWMTS>;
};

export default function SourceFormWMTS({ form }: Props) {
    const [layers, setLayers] = useState<string[]>([]);
    const [matrixSets, setMatrixSets] = useState<string[]>([]);
    const [tileGridString, setTileGridString] = useState<string>(""); // 保存 tileGrid 的 JSON 字符串
    const [loading, setLoading] = useState(false);

    const fetchCapabilities = async () => {
        const url = form.getFieldValue("url");
        if (!url) {
            message.error("请先输入服务 URL");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(url);
            const text = await response.text();
            const parser = new WMTSCapabilities();
            const capabilities = parser.read(text);

            // 提取 layers 和 matrixSets
            const availableLayers = capabilities.Contents.Layer.map((layer: any) => layer.Identifier);
            const availableMatrixSets = capabilities.Contents.TileMatrixSet.map((matrixSet: any) => matrixSet.Identifier);

            setLayers(availableLayers);
            setMatrixSets(availableMatrixSets);

            // 自动生成配置
            const layer = availableLayers[0]; // 默认选择第一个图层
            const matrixSet = availableMatrixSets[0]; // 默认选择第一个矩阵集

            if (!layer || !matrixSet) {
                message.error("无法生成配置，请检查服务是否包含图层和矩阵集");
                return;
            }

            const options = optionsFromCapabilities(capabilities, { layer, matrixSet });
            const wmtsSource: IWMTS = serializeSource(new WMTS(options!)) as unknown as IWMTS;

            // 设置表单的默认值
            form.setFieldsValue({
                layer,
                matrixSet,
                tileGrid: wmtsSource?.tileGrid as any, // 将 tileGrid 设置为对象
            });

            setTileGridString(JSON.stringify(wmtsSource?.tileGrid, null, 2)); // 保存 tileGrid 配置为 JSON 字符串

            message.success("成功获取服务信息！");
        } catch (error) {
            console.error("Error fetching WMTS capabilities:", error);
            message.error("获取服务信息失败，请检查 URL 是否正确");
        } finally {
            setLoading(false);
        }
    };

    const handleTileGridChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setTileGridString(value);

        try {
            const parsed = JSON.parse(value); // 尝试解析 JSON
            form.setFieldsValue({ tileGrid: parsed }); // 将解析后的对象设置回表单
        } catch (error) {
            console.warn("Invalid JSON format for tileGrid");
        }
    };

    return (
        <>
            <Form.Item
                name="url"
                label="服务 URL"
                rules={[{ required: true, message: "请输入 WMTS 服务 URL" }]}
            >
                <Input placeholder="https://example.com/wmts?SERVICE=WMTS&REQUEST=GetCapabilities" />
            </Form.Item>

            <Button onClick={fetchCapabilities} loading={loading}>
                获取服务信息
            </Button>

            <Form.Item
                name="layer"
                label="图层名 (layer)"
                rules={[{ required: true, message: "请选择图层名" }]}
            >
                <Select
                    placeholder="请选择图层"
                    options={layers.map((layer) => ({ value: layer, label: layer }))}
                />
            </Form.Item>

            <Form.Item
                name="matrixSet"
                label="瓦片矩阵集 (matrixSet)"
                rules={[{ required: true, message: "请选择瓦片矩阵集" }]}
            >
                <Select
                    placeholder="请选择瓦片矩阵集"
                    options={matrixSets.map((matrixSet) => ({ value: matrixSet, label: matrixSet }))}
                />
            </Form.Item>

            <Form.Item name="format" label="瓦片格式 (format)" initialValue="image/png">
                <Select>
                    <Select.Option value="image/png">image/png</Select.Option>
                    <Select.Option value="image/jpeg">image/jpeg</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item name="projection" label="投影 (projection)" initialValue="EPSG:3857">
                <Input placeholder="EPSG:3857" />
            </Form.Item>

            <Form.Item name="style" label="样式 (style)" initialValue="default">
                <Input placeholder="default" />
            </Form.Item>

            <Form.Item name="wrapX" valuePropName="checked" initialValue={true}>
                <Checkbox>水平重复 (wrapX)</Checkbox>
            </Form.Item>

            <Form.Item name="tileGrid" label="瓦片网格 (tileGrid)">
                <Input.TextArea
                    value={tileGridString}
                    placeholder="瓦片网格将根据服务自动生成"
                    rows={6}
                    onChange={handleTileGridChange} // 监听用户输入
                />
            </Form.Item>
        </>
    );
}