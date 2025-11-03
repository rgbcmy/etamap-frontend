import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tree, message, Dropdown, Modal, Spin, Input, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  CloudOutlined,
  AimOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import type {
    ServiceConnection,
    RemoteLayer,
    TreeNodeData,
    ServiceType,
    AddLayerConfig
} from '../../types/dataSource';
import {
  fetchWMSLayers,
  fetchXYZLayer,
  createLayerConfig,
} from '../../utils/dataSourceUtils';
import {
  getAllConnections,
  saveConnection,
  deleteConnection as deleteConnectionDB,
  saveDatasource,
  deleteCapabilitiesCache,
} from '../../utils/indexedDB';
import ConnectionDialog from './ConnectionDialog';
import AddLayerDialog from './AddLayerDialog';
import { createLayerWithConfig } from '../../utils/sourceFactory';

interface DataSourceBrowserProps {
  onAddLayer?: (layer: any) => void;
}

// ✅ 将服务类型配置移到组件外部（只创建一次）
const SERVICE_TYPE_CONFIG = {
  wms: { label: 'WMS Services', order: 1 },
  wmts: { label: 'WMTS Services', order: 2 },
  xyz: { label: 'XYZ Tiles', order: 3 },
  wfs: { label: 'WFS Services', order: 4 },
  arcgis: { label: 'ArcGIS Services', order: 5 },
} as const;

const DataSourceBrowser: React.FC<DataSourceBrowserProps> = ({ onAddLayer }) => {
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['root']);
  const [loadedKeys, setLoadedKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ServiceConnection | undefined>();
  const [addLayerDialogVisible, setAddLayerDialogVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ServiceConnection | null>(null);

  // ✅ 获取图标的辅助函数（每次都返回新的 React 元素，但不影响依赖）
  const getServiceIcon = useCallback((type: ServiceType): React.ReactNode => {
    switch (type) {
      case 'wms': return <GlobalOutlined />;
      case 'wmts': return <CloudOutlined />;
      case 'xyz': return <AimOutlined />;
      case 'wfs': return <EnvironmentOutlined />;
      case 'arcgis': return <DatabaseOutlined />;
      default: return <DatabaseOutlined />;
    }
  }, []);

  // ✅ 创建连接节点
  const createConnectionNode = useCallback((connection: ServiceConnection): TreeNodeData => {
    return {
      key: `connection-${connection.id}`,
      title: connection.name,
      type: 'connection',
      icon: <DatabaseOutlined />,
      isLeaf: connection.type === 'xyz',
      connectionId: connection.id,
      connection,
    };
  }, []);

  // ✅ 创建类型组节点
  const createTypeGroupNode = useCallback((
    type: ServiceType,
    connections: ServiceConnection[]
  ): TreeNodeData => {
    const config = SERVICE_TYPE_CONFIG[type];
    return {
      key: `type-${type}`,
      title: `${config.label} (${connections.length})`,
      type: 'type-group',
      icon: getServiceIcon(type),
      serviceType: type,
      children: connections.map(conn => createConnectionNode(conn)),
      isLeaf: false,
    };
  }, [getServiceIcon, createConnectionNode]);

  // ✅ 创建图层节点
  const createLayerNode = useCallback((layer: RemoteLayer): TreeNodeData => {
    const hasChildren = layer.children && layer.children.length > 0;
    
    return {
      key: `layer-${layer.id}`,
      title: layer.title || layer.name,
      type: hasChildren ? 'layer-group' : 'layer',
      icon: hasChildren ? <FolderOutlined /> : <FileOutlined />,
      isLeaf: !hasChildren,
      layerId: layer.id,
      layer,
      children: hasChildren
        ? layer.children!.map(child => createLayerNode(child))
        : undefined,
    };
  }, []);

  // ✅ loadConnections 现在没有会变化的依赖
  const loadConnections = useCallback(async () => {
    console.log('📡 Loading connections...');
    setLoading(true);
    try {
      const connections = await getAllConnections();
      
      const groupedByType: Record<ServiceType, ServiceConnection[]> = {
        wms: [],
        wmts: [],
        xyz: [],
        wfs: [],
        arcgis: [],
      };
      
      connections.forEach(conn => {
        if (groupedByType[conn.type]) {
          groupedByType[conn.type].push(conn);
        }
      });

      const typeGroups: TreeNodeData[] = [];
      
      (Object.entries(SERVICE_TYPE_CONFIG) as [ServiceType, typeof SERVICE_TYPE_CONFIG[ServiceType]][])
        .sort(([, a], [, b]) => a.order - b.order)
        .forEach(([type]) => {
          const conns = groupedByType[type];
          if (conns.length > 0) {
            typeGroups.push(createTypeGroupNode(type, conns));
          }
        });

      const rootNode: TreeNodeData = {
        key: 'root',
        title: 'Data Sources',
        type: 'root',
        icon: <DatabaseOutlined />,
        children: typeGroups,
      };
      
      setTreeData([rootNode]);
      
      if (typeGroups.length > 0) {
        const typeGroupKeys = typeGroups.map(g => g.key);
        setExpandedKeys(['root', ...typeGroupKeys]);
      }
      
    } catch (error) {
      message.error('Failed to load connections');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [createTypeGroupNode]); // ✅ 只依赖稳定的 callback

  // ✅ 只在组件挂载时执行一次
  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // ✅ 更新树数据
  const updateTreeData = useCallback((
    data: TreeNodeData[],
    key: string,
    children: TreeNodeData[]
  ): TreeNodeData[] => {
    return data.map(node => {
      if (node.key === key) {
        return { ...node, children, loading: false };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) };
      }
      return node;
    });
  }, []);

  // ✅ 更新节点加载状态
  const updateNodeLoading = useCallback((key: string, loading: boolean, error?: string) => {
    setTreeData(prevData => {
      const updateNode = (nodes: TreeNodeData[]): TreeNodeData[] => {
        return nodes.map(node => {
          if (node.key === key) {
            return { ...node, loading, error };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prevData);
    });
  }, []);

  // ✅ 懒加载
  const onLoadData = useCallback(async (node: EventDataNode<DataNode>): Promise<void> => {
    const nodeData = node as EventDataNode<DataNode> & TreeNodeData;
    
    // ⚠️ 防止重复加载
    if (loadedKeys.includes(node.key)) {
      console.log('Already loaded:', node.key);
      return;
    }

    if (nodeData.type === 'connection' && nodeData.connection) {
      try {
        console.log('Loading data for:', node.key);
        updateNodeLoading(node.key as string, true);

        let layers: RemoteLayer[];
        
        if (nodeData.connection.type === 'xyz') {
          const layer = await fetchXYZLayer(nodeData.connection);
          layers = [layer];
        } else {
          layers = await fetchWMSLayers(nodeData.connection);
        }

        const childNodes = layers.map(layer => createLayerNode(layer));

        setTreeData(prevData => updateTreeData(prevData, node.key as string, childNodes));
        
        setLoadedKeys(prev => {
          if (prev.includes(node.key)) return prev;
          return [...prev, node.key];
        });
      } catch (error) {
        message.error(`Failed to load layers: ${(error as Error).message}`);
        updateNodeLoading(node.key as string, false, 'Failed to load');
      }
    }
  }, [loadedKeys, createLayerNode, updateTreeData, updateNodeLoading]);

  // ✅ 查找连接
  const findConnection = useCallback((nodes: TreeNodeData[], connectionId: string): ServiceConnection | undefined => {
    for (const node of nodes) {
      if (node.type === 'connection' && node.connectionId === connectionId) {
        return node.connection;
      }
      if (node.children) {
        const found = findConnection(node.children, connectionId);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  // ✅ 右键菜单
  const getContextMenu = useCallback((node: TreeNodeData): MenuProps['items'] => {
    if (node.type === 'root') {
      return [
        {
          key: 'new',
          label: 'New Connection',
          icon: <PlusOutlined />,
          onClick: () => {
            setEditingConnection(undefined);
            setDialogVisible(true);
          },
        },
      ];
    }

    if (node.type === 'type-group') {
      return [
        {
          key: 'new',
          label: `New ${SERVICE_TYPE_CONFIG[node.serviceType!].label.replace(' Services', '')} Connection`,
          icon: <PlusOutlined />,
          onClick: () => {
            setEditingConnection(undefined);
            setDialogVisible(true);
          },
        },
        {
          key: 'refresh',
          label: 'Refresh All',
          icon: <ReloadOutlined />,
          onClick: () => loadConnections(),
        },
      ];
    }

    if (node.type === 'connection') {
      return [
        {
          key: 'refresh',
          label: 'Refresh',
          icon: <ReloadOutlined />,
          onClick: async () => {
            if (!node.connection) return;
            await deleteCapabilitiesCache(node.connection.id);
            setLoadedKeys(prev => prev.filter(k => k !== node.key));
            setTreeData(prevData => updateTreeData(prevData, node.key as string, []));
            message.success('Connection refreshed');
          },
        },
        {
          key: 'edit',
          label: 'Edit Connection',
          icon: <EditOutlined />,
          onClick: () => {
            setEditingConnection(node.connection);
            setDialogVisible(true);
          },
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {
            if (!node.connectionId) return;
            Modal.confirm({
              title: 'Delete Connection',
              icon: <ExclamationCircleOutlined />,
              content: `Are you sure you want to delete "${node.title}"?`,
              okText: 'Delete',
              okType: 'danger',
              onOk: async () => {
                try {
                  await deleteConnectionDB(node.connectionId!);
                  await loadConnections();
                  message.success('Connection deleted');
                } catch (error) {
                  message.error('Failed to delete connection');
                }
              },
            });
          },
        },
      ];
    }

    if (node.type === 'layer-group') {
      return [
        {
          key: 'expand',
          label: 'Expand All Children',
          icon: <FolderOpenOutlined />,
          onClick: () => message.info('Expand all feature coming soon'),
        },
        {
          key: 'properties',
          label: 'Properties',
          icon: <InfoCircleOutlined />,
          onClick: () => {
            if (!node.layer) return;
            Modal.info({
              title: node.title,
              width: 600,
              content: (
                <div>
                  <p><strong>Name:</strong> {node.layer.name}</p>
                  {node.layer.title && <p><strong>Title:</strong> {node.layer.title}</p>}
                  {node.layer.children && (
                    <p><strong>Child Layers:</strong> {node.layer.children.length}</p>
                  )}
                </div>
              ),
            });
          },
        },
      ];
    }

    if (node.type === 'layer' && node.layer) {
      return [
        {
          key: 'add-quick',
          label: 'Add to Map',
          icon: <ThunderboltOutlined />,
          onClick: async () => {
            if (!node.layer || !node.layer.connectionId) return;

            try {
              const connection = findConnection(treeData, node.layer.connectionId);
              if (!connection) {
                message.error('Connection not found');
                return;
              }

              const defaultConfig: AddLayerConfig = {
                name: node.layer.title || node.layer.name,
                visible: true,
                opacity: 1.0,
              };

              if (connection.type === 'wms') {
                defaultConfig.style = node.layer.styles?.[0]?.name;
                defaultConfig.format = node.layer.formats?.[0] || 'image/png';
                defaultConfig.crs = node.layer.crs?.[0] || 'EPSG:3857';
                defaultConfig.transparent = true;
              }

              const layer = createLayerWithConfig(connection, node.layer, defaultConfig);
              
              if (onAddLayer) {
                onAddLayer(layer);
              }

              const savedConfig = createLayerConfig(node.layer, connection);
              await saveDatasource(savedConfig);

              message.success(`Added layer: ${defaultConfig.name}`);
            } catch (error) {
              message.error('Failed to add layer to map');
              console.error(error);
            }
          },
        },
        {
          key: 'add-config',
          label: 'Add with Options...',
          icon: <SettingOutlined />,
          onClick: () => {
            if (!node.layer || !node.layer.connectionId) return;

            const connection = findConnection(treeData, node.layer.connectionId);
            if (!connection) {
              message.error('Connection not found');
              return;
            }

            setSelectedNode(node);
            setSelectedConnection(connection);
            setAddLayerDialogVisible(true);
          },
        },
        {
          type: 'divider',
        },
        {
          key: 'properties',
          label: 'Properties',
          icon: <InfoCircleOutlined />,
          onClick: () => {
            if (!node.layer) return;
            Modal.info({
              title: node.title,
              width: 600,
              content: (
                <div>
                  <p><strong>Name:</strong> {node.layer.name}</p>
                  {node.layer.title && <p><strong>Title:</strong> {node.layer.title}</p>}
                  {node.layer.abstract && <p><strong>Abstract:</strong> {node.layer.abstract}</p>}
                  {node.layer.crs && node.layer.crs.length > 0 && (
                    <p><strong>CRS:</strong> {node.layer.crs.join(', ')}</p>
                  )}
                  {node.layer.formats && node.layer.formats.length > 0 && (
                    <p><strong>Formats:</strong> {node.layer.formats.join(', ')}</p>
                  )}
                </div>
              ),
            });
          },
        },
      ];
    }

    return [];
  }, [findConnection, treeData, updateTreeData, loadConnections, onAddLayer]);

  // ✅ 处理保存连接
  const handleSaveConnection = useCallback(async (connection: ServiceConnection) => {
    try {
      await saveConnection(connection);
      await loadConnections();
      setDialogVisible(false);
      message.success(editingConnection ? 'Connection updated' : 'Connection created');
    } catch (error) {
      message.error('Failed to save connection');
      console.error(error);
    }
  }, [editingConnection, loadConnections]);

  // ✅ 处理添加图层对话框
  const handleAddLayerDialogOk = useCallback(async (config: AddLayerConfig) => {
    if (!selectedNode?.layer || !selectedConnection) return;

    try {
      const layer = createLayerWithConfig(selectedConnection, selectedNode.layer, config);

      if (onAddLayer) {
        onAddLayer(layer);
      }

      const savedConfig = createLayerConfig(selectedNode.layer, selectedConnection);
      await saveDatasource(savedConfig);

      setAddLayerDialogVisible(false);
      setSelectedNode(null);
      setSelectedConnection(null);
      message.success(`Added layer: ${config.name}`);
    } catch (error) {
      message.error('Failed to add layer to map');
      console.error(error);
    }
  }, [selectedNode, selectedConnection, onAddLayer]);

  // ✅ 过滤树数据
  const filteredTreeData = useMemo(() => {
    if (!searchValue) return treeData;

    const filterNodes = (nodes: TreeNodeData[]): TreeNodeData[] => {
      return nodes
        .map(node => {
          const titleMatch = node.title.toLowerCase().includes(searchValue.toLowerCase());
          const filteredChildren = node.children ? filterNodes(node.children) : undefined;
          
          if (titleMatch || (filteredChildren && filteredChildren.length > 0)) {
            return {
              ...node,
              children: filteredChildren,
            };
          }
          return null;
        })
        .filter(Boolean) as TreeNodeData[];
    };

    return filterNodes(treeData);
  }, [treeData, searchValue]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingConnection(undefined);
            setDialogVisible(true);
          }}
          block
          style={{ marginBottom: 16 }}
        >
          New Connection
        </Button>
        
        <Input.Search
          placeholder="Search data sources..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
        <Spin spinning={loading} indicator={<LoadingOutlined spin />}>
          <Tree
            showIcon
            expandedKeys={expandedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            loadData={onLoadData}
            loadedKeys={loadedKeys}
            treeData={filteredTreeData as DataNode[]}
            titleRender={(node: any) => {
              const nodeData = node as TreeNodeData;
              return (
                <Dropdown
                  menu={{ items: getContextMenu(nodeData) }}
                  trigger={['contextMenu']}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '100%',
                      userSelect: 'none',
                    }}
                  >
                    {node.loading ? <LoadingOutlined /> : node.icon}
                    <span style={{ marginLeft: 8 }}>
                      {node.title}
                      {node.error && (
                        <span style={{ color: 'red', marginLeft: 8 }}>
                          ({node.error})
                        </span>
                      )}
                    </span>
                  </span>
                </Dropdown>
              );
            }}
          />
        </Spin>
      </div>

      <ConnectionDialog
        visible={dialogVisible}
        connection={editingConnection}
        onOk={handleSaveConnection}
        onCancel={() => setDialogVisible(false)}
      />

      {/* ✅ 只在数据完整时渲染 */}
      {addLayerDialogVisible && selectedNode?.layer && selectedConnection && (
        <AddLayerDialog
          visible={addLayerDialogVisible}
          connection={selectedConnection}
          layer={selectedNode.layer}
          onOk={handleAddLayerDialogOk}
          onCancel={() => {
            setAddLayerDialogVisible(false);
            setSelectedNode(null);
            setSelectedConnection(null);
          }}
        />
      )}
    </div>
  );
};

export default DataSourceBrowser;