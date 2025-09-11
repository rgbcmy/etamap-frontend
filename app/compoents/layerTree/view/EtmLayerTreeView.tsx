import { Tree, Button, Tooltip, Space, Dropdown, type MenuProps, Popconfirm } from 'antd';
import type { LayerTreeDataNode } from '../model/EtmLayerTreeModel';
import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, FolderAddOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useState } from 'react';

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
    onRemoveLayer: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onShowAllLayers: () => void;
    onHideAllLayers: () => void;
    onShowSelectedLayers: () => void;
    onHideSelectedLayers: () => void;
    onToggleSelectedLayers: () => void;
}

export function LayerTreeView({ ...props }: LayerTreeViewProps) {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showPopconfirm = () => {
        if (props.selectedKeys.length == 0) {
            //todo 需要给出提示选择图层
            console.log('please select layer')
            return;
        }
        setOpen(true);
    };

    const handleOk = () => {
        setConfirmLoading(true);
        props.onRemoveLayer();
        setOpen(false);
        setConfirmLoading(false);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };
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
                        Toggle Selected Layers
                    </span>
                ),
            },
        ],
        onClick: ({ key }) => {
            debugger
            if (key === 'ShowAllLayers') {
                props.onShowAllLayers();
                // expandAll();
            } else if (key === 'HideAllLayers') {
                props.onHideAllLayers()

            } else if (key === 'ShowSelectedLayers') {
                props.onShowSelectedLayers()

            } else if (key === 'HideSelectedLayers') {
                props.onHideSelectedLayers()

            } else if (key === 'ToggleSelectedLayers') {
                props.onToggleSelectedLayers()
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
                    <Tooltip title="Remove Layer/Group">
                        <Popconfirm
                            title="Title"
                            description="sure you want to delete the layers?"
                            open={open}
                            onConfirm={handleOk}
                            okButtonProps={{ loading: confirmLoading }}
                            onCancel={handleCancel}
                        >
                            <Button type="text" icon={<DeleteOutlined />} onClick={showPopconfirm} shape="circle" size="small" />
                        </Popconfirm>

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
