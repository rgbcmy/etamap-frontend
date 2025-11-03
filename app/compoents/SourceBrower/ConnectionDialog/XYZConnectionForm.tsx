import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, Alert, Divider } from 'antd';
import type { ServiceConnection } from '../../../types/dataSource';
import { useConnectionForm } from './useConnectionForm';
import AuthSection from './AuthSection';

interface XYZConnectionFormProps {
  connection?: ServiceConnection;
  onSubmit: (connection: ServiceConnection) => void;
  onCancel: () => void;
  onTypeChange: (type: any) => void;
}

const XYZConnectionForm: React.FC<XYZConnectionFormProps> = ({
  connection,
  onSubmit,
  onCancel,
  onTypeChange,
}) => {
  const [form] = Form.useForm();
  const { isEdit, testing, testConnection } = useConnectionForm(connection, onSubmit);

  useEffect(() => {
    if (connection) {
      form.setFieldsValue({
        name: connection.name,
        type: connection.type,
        url: connection.url,
        zmin: connection.params?.zmin ? parseInt(connection.params.zmin) : undefined,
        zmax: connection.params?.zmax ? parseInt(connection.params.zmax) : undefined,
        tileSize: connection.params?.tileSize ? parseInt(connection.params.tileSize) : 256,
        authType: connection.auth?.type || 'none',
        username: connection.auth?.username,
        password: connection.auth?.password,
        token: connection.auth?.token,
      });
    } else {
      form.setFieldsValue({
        type: 'xyz',
        tileSize: 256,
        authType: 'none',
      });
    }
  }, [connection, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const newConnection: ServiceConnection = {
        id: connection?.id || crypto.randomUUID(),
        name: values.name,
        type: 'xyz',
        url: values.url.trim(),
        params: {
          tileSize: values.tileSize?.toString() || '256',
        },
        createdAt: connection?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (values.zmin !== undefined) {
        newConnection.params!.zmin = values.zmin.toString();
      }
      if (values.zmax !== undefined) {
        newConnection.params!.zmax = values.zmax.toString();
      }

      if (values.authType !== 'none') {
        newConnection.auth = {
          type: values.authType,
        };

        if (values.authType === 'basic') {
          newConnection.auth.username = values.username;
          newConnection.auth.password = values.password;
        } else if (values.authType === 'bearer' || values.authType === 'apikey') {
          newConnection.auth.token = values.token;
        }
      }

      onSubmit(newConnection);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleTest = async () => {
    try {
      const values = await form.validateFields(['url']);
      // 测试时用中心位置的瓦片
      const testUrl = values.url
        .replace('{z}', '2')
        .replace('{x}', '2')
        .replace('{y}', '2');
      await testConnection(testUrl);
    } catch (error) {
      // Validation error
    }
  };

  const loadPreset = (preset: string) => {
    const presets: Record<string, any> = {
      osm: {
        name: 'OpenStreetMap',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        zmin: 0,
        zmax: 19,
      },
      'osm-hot': {
        name: 'OpenStreetMap HOT',
        url: 'https://tile-{a-c}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        zmin: 0,
        zmax: 19,
      },
      'cartodb-light': {
        name: 'CartoDB Light',
        url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        zmin: 0,
        zmax: 19,
      },
      'cartodb-dark': {
        name: 'CartoDB Dark',
        url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        zmin: 0,
        zmax: 19,
      },
    };

    const selected = presets[preset];
    if (selected) {
      form.setFieldsValue(selected);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Alert
        message="XYZ Tiles"
        description="Standard XYZ tiled map service. URL template uses {z}, {x}, {y} placeholders for zoom, column, and row."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item label="Service Type" name="type">
        <Select onChange={onTypeChange}>
          <Select.Option value="wms">WMS</Select.Option>
          <Select.Option value="wmts">WMTS</Select.Option>
          <Select.Option value="xyz">XYZ Tiles</Select.Option>
          <Select.Option value="wfs">WFS</Select.Option>
          <Select.Option value="arcgis">ArcGIS REST</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Quick Presets">
        <Select placeholder="Load a preset configuration" onChange={loadPreset} allowClear>
          <Select.Option value="osm">OpenStreetMap</Select.Option>
          <Select.Option value="osm-hot">OpenStreetMap HOT</Select.Option>
          <Select.Option value="cartodb-light">CartoDB Light</Select.Option>
          <Select.Option value="cartodb-dark">CartoDB Dark</Select.Option>
        </Select>
      </Form.Item>

      <Divider style={{ margin: '12px 0' }} />

      <Form.Item
        label="Connection Name"
        name="name"
        rules={[{ required: true, message: 'Please enter connection name' }]}
      >
        <Input placeholder="e.g., OpenStreetMap" />
      </Form.Item>

      <Form.Item
        label="Tile URL Template"
        name="url"
        rules={[
          { required: true, message: 'Please enter tile URL template' },
        ]}
        extra={
          <>
            Use {'{z}'}, {'{x}'}, {'{y}'} as placeholders. Example:<br />
            <code>https://tile.openstreetmap.org/{'{z}/{x}/{y}'}.png</code>
          </>
        }
      >
        <Input placeholder="https://tile.server/{z}/{x}/{y}.png" />
      </Form.Item>

      <Space style={{ width: '100%' }} size="large">
        <Form.Item label="Min Zoom" name="zmin" style={{ marginBottom: 0 }}>
          <InputNumber min={0} max={22} placeholder="0" style={{ width: 100 }} />
        </Form.Item>

        <Form.Item label="Max Zoom" name="zmax" style={{ marginBottom: 0 }}>
          <InputNumber min={0} max={22} placeholder="19" style={{ width: 100 }} />
        </Form.Item>

        <Form.Item label="Tile Size" name="tileSize" style={{ marginBottom: 0 }}>
          <Select style={{ width: 100 }}>
            <Select.Option value={256}>256px</Select.Option>
            <Select.Option value={512}>512px</Select.Option>
          </Select>
        </Form.Item>
      </Space>

      <AuthSection />

      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Button onClick={handleTest} loading={testing}>
            Test Connection
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default XYZConnectionForm;