import React from 'react';
import { Form, Select, Input, Collapse } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface AuthSectionProps {
  // 可选：如果需要控制展开状态
}

const AuthSection: React.FC<AuthSectionProps> = () => {
  return (
    <Collapse
      ghost
      items={[
        {
          key: 'auth',
          label: (
            <span>
              <LockOutlined /> Authentication (Optional)
            </span>
          ),
          children: (
            <>
              <Form.Item label="Authentication Type" name="authType">
                <Select>
                  <Select.Option value="none">None</Select.Option>
                  <Select.Option value="basic">HTTP Basic</Select.Option>
                  <Select.Option value="bearer">Bearer Token</Select.Option>
                  <Select.Option value="apikey">API Key</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.authType !== currentValues.authType
                }
              >
                {({ getFieldValue }) => {
                  const authType = getFieldValue('authType');

                  if (authType === 'basic') {
                    return (
                      <>
                        <Form.Item
                          label="Username"
                          name="username"
                          rules={[{ required: true, message: 'Please enter username' }]}
                        >
                          <Input placeholder="username" />
                        </Form.Item>
                        <Form.Item
                          label="Password"
                          name="password"
                          rules={[{ required: true, message: 'Please enter password' }]}
                        >
                          <Input.Password placeholder="password" />
                        </Form.Item>
                      </>
                    );
                  }

                  if (authType === 'bearer' || authType === 'apikey') {
                    return (
                      <Form.Item
                        label={authType === 'bearer' ? 'Bearer Token' : 'API Key'}
                        name="token"
                        rules={[{ required: true, message: 'Please enter token' }]}
                      >
                        <Input.Password placeholder="Enter token or key" />
                      </Form.Item>
                    );
                  }

                  return null;
                }}
              </Form.Item>
            </>
          ),
        },
      ]}
    />
  );
};

export default AuthSection;