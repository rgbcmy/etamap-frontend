import { Tree, Button, Tooltip, Space, Dropdown, type MenuProps } from 'antd';
import type { LayerTreeDataNode } from '../model/EtmLayerTreeModel';
import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, FolderAddOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';

interface LayerTreeViewProps {
    checkStrictly?: boolean
    treeData: LayerTreeDataNode[];
    selectedKeys: React.Key[];
    checkedKeys: React.Key[];
    expandedKeys: React.Key[];
    onSelect: (keys: React.Key[], info: any) => void;
    onCheck: (checkedKeys: React.Key[], info: any) => void;
    onDrop: (info: any) => void;
    onExpand: (keys: React.Key[]) => void;
    onAddGroup: () => void;
    onRemoveLayer?: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

export function LayerTreeView({ ...props }: LayerTreeViewProps) {
    const menu: MenuProps = {
        items: [
            {
                key: 'ShowAllLayers',
                label: (
                    <span>
                        <EyeOutlined style={{ marginRight: 8 }} />
                        Show All Layers
                    </span>
                ),
            },
            {
                key: 'HideAllLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        Hide All Layers
                    </span>
                ),
            },
            {
                key: 'ShowSelectedLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        Show Selected Layers
                    </span>
                ),
            },
            {
                key: 'HideSelectedLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        Hide Selected Layers
                    </span>
                ),
            },
            {
                key: 'ToggleSelectedLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        Hide All Layers
                    </span>
                ),
            },
        ],
        onClick: ({ key }) => {
            if (key === 'expandAll') {
                console.log('展开全部');
                props.onExpandAll();
                // expandAll();
            } else if (key === 'collapseAll') {
                console.log('折叠全部');
                // collapseAll();
            }
        },
    };
    return (
        <div>
            <div>
                <Space>
                    <Tooltip title="Add Group"> <Button type="text" icon={<FolderAddOutlined />} onClick={props.onAddGroup} shape="circle" size="small" />
                    </Tooltip>
                    <Tooltip title="Mange Map Themes">
                        <Dropdown menu={menu} trigger={['click']}>
                            <Button type="text" icon={<EyeOutlined />} shape="circle" size="small" />
                        </Dropdown>

                    </Tooltip>
                    <Tooltip title="Expand All"> <Button type="text" icon={<PlusSquareOutlined onClick={props.onExpandAll} />} shape="circle" size="small" />
                    </Tooltip>
                    <Tooltip title="Collapse All"> <Button type="text" icon={<MinusSquareOutlined onClick={props.onCollapseAll} />} shape="circle" size="small" />
                    </Tooltip>
                    <Tooltip title="Remove Layer/Group"> <Button type="text" icon={<DeleteOutlined />} shape="circle" size="small" />
                    </Tooltip>
                </Space>
            </div>
            <Tree
                checkStrictly={props.checkStrictly}
                checkable
                multiple
                draggable={{
                    icon: false, // 不显示默认的 6 个点
                    //nodeDraggable: (node) => node.draggable ?? true // 可选择哪些节点可拖
                }}
                treeData={props.treeData}
                selectedKeys={props.selectedKeys}
                checkedKeys={props.checkedKeys}
                expandedKeys={props.expandedKeys}
                onSelect={props.onSelect}
                onCheck={props.onCheck as any}
                onDrop={props.onDrop}
                onExpand={props.onExpand}
            />
        </div>
    )
}
