import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Slider,
  Select,
  Switch,
  Tabs,
  InputNumber,
  ColorPicker,
  Space,
  Alert,
} from 'antd';
import type { Color } from 'antd/es/color-picker';
import type { ServiceConnection, RemoteLayer } from '../../types/dataSource';

interface AddLayerDialogProps {
  visible: boolean;
  connection: ServiceConnection;
  layer: RemoteLayer;
  onOk: (config: AddLayerConfig) => void;
  onCancel: () => void;
}

export interface AddLayerConfig {
  name: string;
  visible: boolean;
  opacity: number;
  minZoom?: number;
  maxZoom?: number;
  
  // WMS 特有
  style?: string;
  format?: string;
  crs?: string;
  transparent?: boolean;
  bgcolor?: string;
  
  // 其他
  zIndex?: number;
}

const AddLayerDialog: React.FC<AddLayerDialogProps> = ({
  visible,
  connection,
  layer,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (visible) {
      // 初始化默认值
      form.setFieldsValue({
        name: layer.title || layer.name,
        visible: true,
        opacity: 100,
        style: layer.styles?.[0]?.name || '',
        format: layer.formats?.[0] || 'image/png',
        crs: layer.crs?.[0] || 'EPSG:3857',
        transparent: true,
        bgcolor: '#ffffff',
      });
    }
  }, [visible, layer, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const config: AddLayerConfig = {
        name: values.name,
        visible: values.visible,
        opacity: values.opacity / 100, // 转换为 0-1
        minZoom: values.minZoom,
        maxZoom: values.maxZoom,
        zIndex: values.zIndex,
      };

      // WMS 特有参数
      if (connection.type === 'wms') {
        config.style = values.style;
        config.format = values.format;
        config.crs = values.crs;
        config.transparent = values.transparent;
        config.bgcolor = values.bgcolor;
      }

      onOk(config);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderGeneralTab = () => (
    <div>
      <Form.Item
        label="Layer Name"
        name="name"
        rules={[{ required: true, message: 'Please enter layer name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Visible on Load" name="visible" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item label="Opacity" name="opacity">
        <Slider
          min={0}
          max={100}
          marks={{ 0: '0%', 50: '50%', 100: '100%' }}
          tooltip={{ formatter: (value) => `${value}%` }}
        />
      </Form.Item>

      <Space size="large" style={{ width: '100%' }}>
        <Form.Item label="Min Zoom" name="minZoom" style={{ marginBottom: 0 }}>
          <InputNumber min={0} max={22} placeholder="Auto" style={{ width: 100 }} />
        </Form.Item>

        <Form.Item label="Max Zoom" name="maxZoom" style={{ marginBottom: 0 }}>
          <InputNumber min={0} max={22} placeholder="Auto" style={{ width: 100 }} />
        </Form.Item>

        <Form.Item label="Z-Index" name="zIndex" style={{ marginBottom: 0 }}>
          <InputNumber placeholder="Auto" style={{ width: 100 }} />
        </Form.Item>
      </Space>
    </div>
  );

  const renderWMSTab = () => {
    if (connection.type !== 'wms') return null;

    return (
      <div>
        <Form.Item label="Style" name="style">
          <Select allowClear placeholder="Default style">
            {layer.styles?.map((style) => (
              <Select.Option key={style.name} value={style.name}>
                {style.title || style.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Image Format" name="format">
          <Select>
            {layer.formats?.map((format) => (
              <Select.Option key={format} value={format}>
                {format}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Coordinate System" name="crs">
          <Select showSearch>
            {layer.crs?.map((crs) => (
              <Select.Option key={crs} value={crs}>
                {crs}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Transparent" name="transparent" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.transparent !== curr.transparent}
        >
          {({ getFieldValue }) =>
            !getFieldValue('transparent') ? (
              <Form.Item label="Background Color" name="bgcolor">
                <Input type="color" style={{ width: 100 }} />
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </div>
    );
  };

  const renderPreviewTab = () => (
    <div>
      <Alert
        message="Layer Information"
        description={
          <div>
            <p><strong>Source:</strong> {connection.name}</p>
            <p><strong>Type:</strong> {connection.type.toUpperCase()}</p>
            <p><strong>Layer:</strong> {layer.name}</p>
            {layer.abstract && <p><strong>Description:</strong> {layer.abstract}</p>}
            {layer.bbox && (
              <p>
                <strong>Extent:</strong> [{layer.bbox.minx.toFixed(2)},{' '}
                {layer.bbox.miny.toFixed(2)}, {layer.bbox.maxx.toFixed(2)},{' '}
                {layer.bbox.maxy.toFixed(2)}]
              </p>
            )}
          </div>
        }
        type="info"
      />
    </div>
  );

  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: renderGeneralTab(),
    },
  ];

  if (connection.type === 'wms') {
    const wmsTab = renderWMSTab();
    if (wmsTab) {
      tabItems.push({
        key: 'wms',
        label: 'WMS Options',
        children: wmsTab,
      });
    }
  }

  tabItems.push({
    key: 'info',
    label: 'Information',
    children: renderPreviewTab(),
  });

  return (
    <Modal
      title={`Add Layer: ${layer.title || layer.name}`}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      okText="Add to Map"
    >
      <Form form={form} layout="vertical">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Form>
    </Modal>
  );
};

export default AddLayerDialog;