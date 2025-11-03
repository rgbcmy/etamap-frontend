import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Space, Row, Col, Divider, Tooltip } from "antd";
import { PlusOutlined, MinusCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { ITileGrid } from "node_modules/openlayers-serializer/dist/dto/source";
import type { FormInstance } from "antd";

type Props = {
  form?: FormInstance<ITileGrid>;
  name?: string;
  label?: string;
};

export default function TileGridForm({ name = "tileGrid", label = "TileGrid 设置" }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #f0f0f0",
        borderRadius: 6,
        padding: 16,
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ marginBottom: 16, fontWeight: 500, color: "#333", display: "flex", alignItems: "center", gap: 8 }}>
        {label}
        <Tooltip title="配置瓦片网格参数，用于自定义瓦片切片方案">
          <InfoCircleOutlined style={{ color: "#999" }} />
        </Tooltip>
      </div>

      {/* 基本配置 */}
      <div style={{ marginBottom: 16 }}>
        <h5 style={{ margin: "0 0 12px 0", color: "#666" }}>基本配置</h5>
        
        {/* extent - 地理范围 */}
        <Form.Item label="地理范围 (extent)" tooltip="定义数据的地理边界 [minX, minY, maxX, maxY]">
          <Row gutter={8}>
            <Col span={6}>
              <Form.Item name={[name, "extent", 0]} noStyle>
                <InputNumber 
                  placeholder="最小X" 
                  style={{ width: "100%" }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[name, "extent", 1]} noStyle>
                <InputNumber 
                  placeholder="最小Y" 
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[name, "extent", 2]} noStyle>
                <InputNumber 
                  placeholder="最大X" 
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={[name, "extent", 3]} noStyle>
                <InputNumber 
                  placeholder="最大Y" 
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {/* minZoom */}
        <Form.Item 
          name={[name, "minZoom"]} 
          label="最小缩放等级"
          tooltip="允许的最小缩放级别"
        >
          <InputNumber min={0} max={30} style={{ width: "100%" }} placeholder="如：0" />
        </Form.Item>

        {/* origin - 瓦片原点 */}
        <Form.Item label="瓦片原点 (origin)" tooltip="瓦片坐标系统的原点 [x, y]">
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name={[name, "origin", 0]} noStyle>
                <InputNumber 
                  placeholder="原点 X 坐标" 
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={[name, "origin", 1]} noStyle>
                <InputNumber 
                  placeholder="原点 Y 坐标" 
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {/* tileSize - 瓦片大小，支持单个数字或数组 */}
        <Form.Item 
          label="瓦片大小 (tileSize)" 
          tooltip="瓦片的像素大小，可以是单个数字(如256)或数组[宽,高]"
        >
          <Form.Item name={[name, "tileSize"]} noStyle>
            <Input 
              placeholder="256 或 [256, 256]" 
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form.Item>

        {/* resolutions - 分辨率数组 */}
        <Form.Item
          name={[name, "resolutions"]}
          label="分辨率数组 (resolutions)"
          tooltip="每个缩放级别对应的分辨率，从大到小排列"
          extra="用逗号分隔的数值，例如：156543.03, 78271.51, 39135.76"
        >
          <Input.TextArea
            placeholder="156543.03392804097, 78271.51696402048, 39135.758482010236, 19567.87924100512"
            rows={2}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>
      </div>

      {/* 高级配置 */}
      <Divider style={{ margin: "16px 0" }}>
        <Button 
          type="link" 
          size="small"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '隐藏' : '显示'}高级配置
        </Button>
      </Divider>

      {showAdvanced && (
        <div style={{ border: "1px solid #e8e8e8", borderRadius: 4, padding: 12, backgroundColor: "#fff" }}>
          {/* origins - 多级原点 */}
          <Form.List name={[name, "origins"]}>
            {(fields, { add, remove }) => (
              <>
                <Form.Item 
                  label="多级原点 (origins)" 
                  tooltip="为不同缩放级别设置不同的原点坐标"
                  extra={fields.length === 0 ? "可选：为每个缩放级别定义不同的原点坐标" : undefined}
                >
                  {fields.length === 0 && (
                    <Button 
                      type="dashed" 
                      onClick={() => add([0, 0])} 
                      icon={<PlusOutlined />} 
                      block
                      size="small"
                    >
                      添加多级原点设置
                    </Button>
                  )}
                </Form.Item>
                
                {fields.map(({ key, name: fieldName, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[fieldName, 0]}
                        noStyle
                      >
                        <InputNumber 
                          placeholder="X坐标" 
                          style={{ width: "100%" }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[fieldName, 1]}
                        noStyle
                      >
                        <InputNumber 
                          placeholder="Y坐标" 
                          style={{ width: "100%" }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircleOutlined />} 
                        onClick={() => remove(fieldName)}
                        size="small"
                      />
                    </Col>
                  </Row>
                ))}
                
                {fields.length > 0 && (
                  <Button 
                    type="dashed" 
                    onClick={() => add([0, 0])} 
                    icon={<PlusOutlined />} 
                    block
                    size="small"
                  >
                    添加原点
                  </Button>
                )}
              </>
            )}
          </Form.List>

          {/* sizes - 每级瓦片数量 */}
          <Form.List name={[name, "sizes"]}>
            {(fields, { add, remove }) => (
              <>
                <Form.Item 
                  label="每级瓦片数量 (sizes)" 
                  tooltip="为每个缩放级别指定瓦片的列数和行数"
                  extra={fields.length === 0 ? "可选：限制每个缩放级别的瓦片数量" : undefined}
                >
                  {fields.length === 0 && (
                    <Button 
                      type="dashed" 
                      onClick={() => add([1, 1])} 
                      icon={<PlusOutlined />} 
                      block
                      size="small"
                    >
                      添加瓦片数量限制
                    </Button>
                  )}
                </Form.Item>
                
                {fields.map(({ key, name: fieldName, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[fieldName, 0]}
                        noStyle
                      >
                        <InputNumber 
                          placeholder="列数" 
                          min={1} 
                          style={{ width: "100%" }} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[fieldName, 1]}
                        noStyle
                      >
                        <InputNumber 
                          placeholder="行数" 
                          min={1} 
                          style={{ width: "100%" }} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircleOutlined />} 
                        onClick={() => remove(fieldName)}
                        size="small"
                      />
                    </Col>
                  </Row>
                ))}
                
                {fields.length > 0 && (
                  <Button 
                    type="dashed" 
                    onClick={() => add([1, 1])} 
                    icon={<PlusOutlined />} 
                    block
                    size="small"
                  >
                    添加瓦片数量
                  </Button>
                )}
              </>
            )}
          </Form.List>

          {/* tileSizes - 多级瓦片大小 */}
          <Form.List name={[name, "tileSizes"]}>
            {(fields, { add, remove }) => (
              <>
                <Form.Item 
                  label="多级瓦片大小 (tileSizes)" 
                  tooltip="为不同缩放级别设置不同的瓦片大小"
                  extra={fields.length === 0 ? "可选：为每个缩放级别定义不同的瓦片尺寸" : undefined}
                >
                  {fields.length === 0 && (
                    <Button 
                      type="dashed" 
                      onClick={() => add([256, 256])} 
                      icon={<PlusOutlined />} 
                      block
                      size="small"
                    >
                      添加多级瓦片大小
                    </Button>
                  )}
                </Form.Item>
                
                {fields.map(({ key, name: fieldName, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[fieldName, 0]}
                        noStyle
                      >
                        <InputNumber 
                          placeholder="宽度" 
                          min={64} 
                          max={1024} 
                          style={{ width: "100%" }} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[fieldName, 1]}
                        noStyle
                      >
                        <InputNumber 
                          placeholder="高度" 
                          min={64} 
                          max={1024} 
                          style={{ width: "100%" }} 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button 
                        type="text" 
                        danger 
                        icon={<MinusCircleOutlined />} 
                        onClick={() => remove(fieldName)}
                        size="small"
                      />
                    </Col>
                  </Row>
                ))}
                
                {fields.length > 0 && (
                  <Button 
                    type="dashed" 
                    onClick={() => add([256, 256])} 
                    icon={<PlusOutlined />} 
                    block
                    size="small"
                  >
                    添加瓦片大小
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </div>
      )}
    </div>
  );
}
