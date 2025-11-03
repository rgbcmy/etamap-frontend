import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, Alert } from 'antd';
import type { ServiceConnection } from '../../../types/dataSource';
import { useConnectionForm } from './useConnectionForm';
import AuthSection from './AuthSection';

interface WFSConnectionFormProps {
  connection?: ServiceConnection;
  onSubmit: (connection: ServiceConnection) => void;
  onCancel: () => void;
  onTypeChange: (type: any) => void;
}

const WFSConnectionForm: React.FC<WFSConnectionFormProps> = ({
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
        version: connection.params?.version || '2.0.0',
        outputFormat: connection.params?.outputFormat || 'application/json',
        authType: connection.auth?.type || 'none',
        username: connection.auth?.username,
        password: connection.auth?.password,
        token: connection.auth?.token,
      });
    } else {
      form.setFieldsValue({
        type: 'wfs',
        version: '2.0.0',
        outputFormat: 'application/json',
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
        type: 'wfs',
        url: values.url.trim(),
        params: {
          version: values.version,
          outputFormat: values.outputFormat,
        },
        createdAt: connection?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

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
      await testConnection(values.url);
    } catch (error) {
      // Validation error
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Alert
        message="WFS (Web Feature Service)"
        description="OGC standard for serving vector features. Returns actual geometry and attributes, not just images."
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

      <Form.Item
        label="Connection Name"
        name="name"
        rules={[{ required: true, message: 'Please enter connection name' }]}
      >
        <Input placeholder="e.g., GeoServer WFS" />
      </Form.Item>

      <Form.Item
        label="Service URL"
        name="url"
        rules={[
          { required: true, message: 'Please enter service URL' },
          { type: 'url', message: 'Please enter a valid URL' },
        ]}
        extra="Base WFS service endpoint"
      >
        <Input placeholder="https://example.com/geoserver/wfs" />
      </Form.Item>

      <Form.Item label="WFS Version" name="version" rules={[{ required: true }]}>
        <Select>
          <Select.Option value="2.0.0">2.0.0 (Recommended)</Select.Option>
          <Select.Option value="1.1.0">1.1.0</Select.Option>
          <Select.Option value="1.0.0">1.0.0</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Output Format" name="outputFormat" rules={[{ required: true }]}>
        <Select>
          <Select.Option value="application/json">GeoJSON (Recommended)</Select.Option>
          <Select.Option value="GML3">GML 3</Select.Option>
          <Select.Option value="GML2">GML 2</Select.Option>
        </Select>
      </Form.Item>

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

export default WFSConnectionForm;