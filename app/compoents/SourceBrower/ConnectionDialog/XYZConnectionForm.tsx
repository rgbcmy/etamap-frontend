import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, Alert, Divider, Collapse, Checkbox, Row, Col } from 'antd';
import type { ServiceConnection } from '../../../types/dataSource';
import { useConnectionForm } from './useConnectionForm';
import AuthSection from './AuthSection';

const { Panel } = Collapse;

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
        minZoom: connection.params?.minZoom ? parseInt(connection.params.minZoom) : undefined,
        maxZoom: connection.params?.maxZoom ? parseInt(connection.params.maxZoom) : undefined,
        tileSize: connection.params?.tileSize ? JSON.parse(connection.params.tileSize) : [256, 256],
        projection: connection.params?.projection || 'EPSG:3857',
        crossOrigin: connection.params?.crossOrigin,
        wrapX: connection.params?.wrapX !== undefined ? connection.params.wrapX === 'true' : true,
        transition: connection.params?.transition ? parseInt(connection.params.transition) : 250,
        // 高级参数
        attributions: connection.params?.attributions ? JSON.parse(connection.params.attributions) : undefined,
        attributionsCollapsible: connection.params?.attributionsCollapsible !== undefined ? connection.params.attributionsCollapsible === 'true' : true,
        interpolate: connection.params?.interpolate !== undefined ? connection.params.interpolate === 'true' : true,
        opaque: connection.params?.opaque === 'true',
        tilePixelRatio: connection.params?.tilePixelRatio ? parseFloat(connection.params.tilePixelRatio) : 1,
        gutter: connection.params?.gutter ? parseInt(connection.params.gutter) : 0,
        reprojectionErrorThreshold: connection.params?.reprojectionErrorThreshold ? parseFloat(connection.params.reprojectionErrorThreshold) : 0.5,
        zDirection: connection.params?.zDirection ? parseInt(connection.params.zDirection) : 0,
        maxResolution: connection.params?.maxResolution ? parseFloat(connection.params.maxResolution) : undefined,
        cacheSize: connection.params?.cacheSize ? parseInt(connection.params.cacheSize) : undefined,
        tileGrid: connection.params?.tileGrid,
        tileLoadFunction: connection.params?.tileLoadFunction,
        tileUrlFunction: connection.params?.tileUrlFunction,
        authType: connection.auth?.type || 'none',
        username: connection.auth?.username,
        password: connection.auth?.password,
        token: connection.auth?.token,
      });
    } else {
      form.setFieldsValue({
        type: 'xyz',
        tileSize: [256, 256],
        projection: 'EPSG:3857',
        wrapX: true,
        transition: 250,
        attributionsCollapsible: true,
        interpolate: true,
        opaque: false,
        tilePixelRatio: 1,
        gutter: 0,
        reprojectionErrorThreshold: 0.5,
        zDirection: 0,
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
          tileSize: JSON.stringify(values.tileSize || [256, 256]),
          projection: values.projection || 'EPSG:3857',
          wrapX: values.wrapX?.toString() || 'true',
          transition: values.transition?.toString() || '250',
        },
        createdAt: connection?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 基础参数
      if (values.minZoom !== undefined) {
        newConnection.params!.minZoom = values.minZoom.toString();
      }
      if (values.maxZoom !== undefined) {
        newConnection.params!.maxZoom = values.maxZoom.toString();
      }
      if (values.crossOrigin) {
        newConnection.params!.crossOrigin = values.crossOrigin;
      }

      // 高级参数 - 只保存非默认值
      if (values.attributions && values.attributions.length > 0) {
        newConnection.params!.attributions = JSON.stringify(values.attributions);
      }
      if (values.attributionsCollapsible !== undefined && values.attributionsCollapsible !== true) {
        newConnection.params!.attributionsCollapsible = values.attributionsCollapsible.toString();
      }
      if (values.interpolate !== undefined && values.interpolate !== true) {
        newConnection.params!.interpolate = values.interpolate.toString();
      }
      if (values.opaque) {
        newConnection.params!.opaque = 'true';
      }
      if (values.tilePixelRatio !== undefined && values.tilePixelRatio !== 1) {
        newConnection.params!.tilePixelRatio = values.tilePixelRatio.toString();
      }
      if (values.gutter !== undefined && values.gutter !== 0) {
        newConnection.params!.gutter = values.gutter.toString();
      }
      if (values.reprojectionErrorThreshold !== undefined && values.reprojectionErrorThreshold !== 0.5) {
        newConnection.params!.reprojectionErrorThreshold = values.reprojectionErrorThreshold.toString();
      }
      if (values.zDirection !== undefined && values.zDirection !== 0) {
        newConnection.params!.zDirection = values.zDirection.toString();
      }
      if (values.maxResolution !== undefined) {
        newConnection.params!.maxResolution = values.maxResolution.toString();
      }
      if (values.cacheSize !== undefined) {
        newConnection.params!.cacheSize = values.cacheSize.toString();
      }
      if (values.tileGrid) {
        newConnection.params!.tileGrid = values.tileGrid;
      }
      if (values.tileLoadFunction) {
        newConnection.params!.tileLoadFunction = values.tileLoadFunction;
      }
      if (values.tileUrlFunction) {
        newConnection.params!.tileUrlFunction = values.tileUrlFunction;
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

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Min Zoom" name="minZoom">
            <InputNumber min={0} max={42} placeholder="0" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Max Zoom" name="maxZoom">
            <InputNumber min={0} max={42} placeholder="19" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Projection" name="projection">
            <Input placeholder="EPSG:3857" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Tile Size (Width × Height)">
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item name={['tileSize', 0]} noStyle>
            <InputNumber min={1} placeholder="256" style={{ width: '50%' }} />
          </Form.Item>
          <Form.Item name={['tileSize', 1]} noStyle>
            <InputNumber min={1} placeholder="256" style={{ width: '50%' }} />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item label="Cross Origin" name="crossOrigin" extra="Set to 'anonymous' to access pixel data with Canvas renderer">
        <Select placeholder="Select cross origin" allowClear>
          <Select.Option value="anonymous">anonymous</Select.Option>
          <Select.Option value="use-credentials">use-credentials</Select.Option>
        </Select>
      </Form.Item>

      <Collapse 
        ghost 
        style={{ marginTop: 16, marginBottom: 16 }}
        items={[
          {
            key: 'display',
            label: '🎨 显示选项',
            children: (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Transition (ms)" name="transition" tooltip="Opacity transition duration, set to 0 to disable">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Tile Pixel Ratio" name="tilePixelRatio" tooltip="For retina/HiDPI displays">
                      <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="wrapX" valuePropName="checked">
                  <Checkbox>Wrap X (水平环绕世界)</Checkbox>
                </Form.Item>

                <Form.Item name="interpolate" valuePropName="checked">
                  <Checkbox>Interpolate (使用线性插值重采样)</Checkbox>
                </Form.Item>

                <Form.Item name="opaque" valuePropName="checked">
                  <Checkbox>Opaque (图层不透明)</Checkbox>
                </Form.Item>

                <Form.Item label="Attributions" name="attributions" tooltip="Data source attributions">
                  <Select
                    mode="tags"
                    tokenSeparators={[',', '\n']}
                    placeholder="输入数据来源后按回车"
                  />
                </Form.Item>

                <Form.Item name="attributionsCollapsible" valuePropName="checked">
                  <Checkbox>Attributions Collapsible</Checkbox>
                </Form.Item>
              </>
            ),
          },
          {
            key: 'performance',
            label: '⚡ 性能优化',
            children: (
              <>
                <Form.Item label="Cache Size" name="cacheSize" tooltip="Initial tile cache size, auto-grows by default">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="Leave empty for auto-grow" />
                </Form.Item>

                <Form.Item label="Reprojection Error Threshold" name="reprojectionErrorThreshold" tooltip="Maximum allowed reprojection error in pixels">
                  <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Z Direction" name="zDirection" tooltip="0: default, 1: higher zoom, -1: lower zoom">
                  <Select style={{ width: '100%' }}>
                    <Select.Option value={-1}>-1 (Lower Zoom)</Select.Option>
                    <Select.Option value={0}>0 (Default)</Select.Option>
                    <Select.Option value={1}>1 (Higher Zoom)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Gutter" name="gutter" tooltip="Size in pixels of the gutter around tiles to ignore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="Max Resolution" name="maxResolution" tooltip="Optional tile grid resolution at level zero">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'advanced',
            label: '🔧 高级自定义',
            children: (
              <>
                <Form.Item 
                  label="Tile Grid (JSON)" 
                  name="tileGrid" 
                  tooltip="Custom tile grid configuration"
                  extra={<>例如: {`{"tileSize":256,"extent":[...]}`}</>}
                >
                  <Input.TextArea rows={4} placeholder='{"tileSize": 256, "extent": [...]}' />
                </Form.Item>

                <Form.Item 
                  label="Tile Load Function" 
                  name="tileLoadFunction"
                  tooltip="Custom function to load a tile given a URL"
                  extra="Function name or script string"
                >
                  <Input.TextArea rows={3} placeholder="function(imageTile, src) { ... }" />
                </Form.Item>

                <Form.Item 
                  label="Tile URL Function" 
                  name="tileUrlFunction"
                  tooltip="Custom function to get tile URL"
                  extra="Function name or template"
                >
                  <Input.TextArea rows={3} placeholder="function(tileCoord, pixelRatio, projection) { ... }" />
                </Form.Item>
              </>
            ),
          },
        ]}
      />

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