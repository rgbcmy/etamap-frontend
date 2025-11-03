import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, Alert, Radio } from 'antd';
import type { ServiceConnection } from '../../../types/dataSource';
import { useConnectionForm } from './useConnectionForm';
import AuthSection from './AuthSection';

interface ArcGISConnectionFormProps {
  connection?: ServiceConnection;
  onSubmit: (connection: ServiceConnection) => void;
  onCancel: () => void;
  onTypeChange: (type: any) => void;
}

const ArcGISConnectionForm: React.FC<ArcGISConnectionFormProps> = ({
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
        serviceType: connection.params?.serviceType || 'MapServer',
        authType: connection.auth?.type || 'none',
        username: connection.auth?.username,
        password: connection.auth?.password,
        token: connection.auth?.token,
      });
    } else {
      form.setFieldsValue({
        type: 'arcgis',
        serviceType: 'MapServer',
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
        type: 'arcgis',
        url: values.url.trim(),
        params: {
          serviceType: values.serviceType,
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
      // 测试时访问 ?f=json
      const testUrl = values.url.endsWith('/') ? `${values.url}?f=json` : `${values.url}/?f=json`;
      await testConnection(testUrl);
    } catch (error) {
      // Validation error
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Alert
        message="ArcGIS REST Services"
        description="Esri ArcGIS Server REST API. Supports MapServer, FeatureServer, and ImageServer."
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
        <Input placeholder="e.g., ArcGIS Online" />
      </Form.Item>

      <Form.Item label="ArcGIS Service Type" name="serviceType">
        <Radio.Group>
          <Radio value="MapServer">MapServer (Images)</Radio>
          <Radio value="FeatureServer">FeatureServer (Vectors)</Radio>
          <Radio value="ImageServer">ImageServer (Imagery)</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="Service URL"
        name="url"
        rules={[
          { required: true, message: 'Please enter service URL' },
          { type: 'url', message: 'Please enter a valid URL' },
        ]}
        extra={
          <>
            Full service URL including service type. Example:<br />
            <code>https://sampleserver6.arcgisonline.com/arcgis/rest/services/World/MapServer</code>
          </>
        }
      >
        <Input placeholder="https://example.com/arcgis/rest/services/.../MapServer" />
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

export default ArcGISConnectionForm;