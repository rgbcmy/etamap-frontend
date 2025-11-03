import { useState } from 'react';
import { message } from 'antd';
import type { ServiceConnection } from '../../../types/dataSource';

export function useConnectionForm(
  connection: ServiceConnection | undefined,
  onSubmit: (conn: ServiceConnection) => void
) {
  const [testing, setTesting] = useState(false);

  const testConnection = async (url: string, headers?: HeadersInit) => {
    setTesting(true);
    try {
      message.loading({ content: 'Testing connection...', key: 'test' });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        method: 'HEAD',
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        message.success({ content: 'Connection successful!', key: 'test', duration: 2 });
        return true;
      } else {
        message.warning({
          content: `Server responded with status ${response.status}`,
          key: 'test',
          duration: 3,
        });
        return false;
      }
    } catch (error) {
      const err = error as Error;
      if (err.name === 'AbortError') {
        message.error({ content: 'Connection timeout', key: 'test', duration: 3 });
      } else {
        message.error({
          content: `Connection failed: ${err.message}`,
          key: 'test',
          duration: 3,
        });
      }
      return false;
    } finally {
      setTesting(false);
    }
  };

  return {
    isEdit: !!connection,
    testing,
    testConnection,
  };
}