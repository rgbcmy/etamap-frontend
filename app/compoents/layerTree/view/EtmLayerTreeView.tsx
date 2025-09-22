import { Tree, Button, Tooltip, Space, Dropdown, type MenuProps, Popconfirm, Input, Menu } from 'antd';
import type { LayerTreeDataNode } from '../model/EtmLayerTreeModel';
import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, FolderAddOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
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
    onRename: (id: string, newName: string) => void;
    clearSelect?: () => void;
}

export function LayerTreeView({ ...props }: LayerTreeViewProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [editingKey, setEditingKey] = useState<React.Key | null>(null);
    const [tempName, setTempName] = useState("");
    // 右键菜单控制
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        items: MenuProps['items'];
        node?: any;
    } | null>(null);

    // 点击空白处关闭右键菜单
    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu]);


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
    const tileRender =
        (node: any) => {
            //右键菜单
            const nodeMenu: MenuProps = {
                items: [
                    { key: "rename", label: "Rename" },
                    { key: "remove", label: "Remove" },
                    { type: "divider" },
                    { key: "addGroup", label: "Add Subgroup" },
                ],
                onClick: ({ key }) => {
                    if (key === "rename") {
                        setEditingKey(node.key);
                        setTempName(node.title as string);
                    } else if (key === "remove") {
                        props.onRemoveLayer();
                    } else if (key === "addGroup") {
                        props.onAddGroup();
                    }
                },
            };
            if (editingKey === node.key) {
                return (
                    <Input
                        size="small"
                        value={tempName}
                        autoFocus
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={() => {
                            props.onRename?.(node.key, tempName);
                            setEditingKey(null);
                        }}
                        onPressEnter={() => {
                            props.onRename?.(node.key, tempName);
                            setEditingKey(null);
                        }}
                    />
                );
            }
            return (
                <span
                    onDoubleClick={() => {

                        setEditingKey(node.key);
                        setTempName(node.title as string);
                    }}
                >
                    {node.title}
                </span>
            );
        }
    // 右键菜单触发
    const handleRightClick = ({ event, node }: any) => {

        event.preventDefault();
        // 先选中右键点击的节点
        props.onSelect([node.key], { selected: true, node, nativeEvent: event });

        const isGroup = node?.isGroup; // 你在 treeData 里定义的标记
        const items: MenuProps['items'] = [];

        if (isGroup) {
            items.push(
                { key: 'rename', label: '重命名组' },
                { key: 'addLayer', label: '添加子图层' },
                { key: 'addGroup', label: '添加子组' },
                { key: 'remove', label: '删除组' }
            );
        } else if (node) {
            items.push(
                { key: 'rename', label: '重命名图层' },
                {
                    key: 'toggleVisibility',
                    label: node.visible ? '隐藏图层' : '显示图层'
                },
                { key: 'remove', label: '删除图层' }
            );
        } else {
            // 空白区域
            items.push({ key: 'addGroup', label: '新建组' });
        }

        setContextMenu({ x: event.clientX, y: event.clientY, items, node });
    };

    const handleContextMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (!contextMenu) return;
        const node = contextMenu.node;

        switch (key) {
            case 'rename':
                setEditingKey(node.key);
                setTempName(node.title);
                break;
            case 'remove':
                props.onRemoveLayer();
                break;
            case 'addGroup':
                props.onAddGroup();
                break;
            case 'addLayer':
                console.log('TODO: 添加子图层到组', node.key);
                break;
            case 'toggleVisibility':
                props.onToggleSelectedLayers();
                break;
            case 'expandAll':
                props.onExpandAll();
                break;
            case 'collapseAll':
                props.onCollapseAll();
                break;
        }

        setContextMenu(null);
    };
    const menu: MenuProps = {
        items: [
            {
                key: 'ShowAllLayers',
                label: (
                    <span>
                        <EyeOutlined style={{ marginRight: 8 }} />
                        {t("layer.showAll")}
                    </span>
                ),

            },
            {
                key: 'HideAllLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        {t("layer.hideAll")}
                    </span>
                ),
            },
            {
                key: 'ShowSelectedLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        {t("layer.showSelected")}
                    </span>
                ),
            },
            {
                key: 'HideSelectedLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        {t("layer.hideSelected")}
                    </span>
                ),
            },
            {
                key: 'ToggleSelectedLayers',
                label: (
                    <span>
                        <EyeInvisibleOutlined style={{ marginRight: 8 }} />
                        {t("layer.toggleSelected")}
                    </span>
                ),
            },
        ],
        onClick: ({ key }) => {

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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
            onContextMenu={(event) => {
                // 如果右键点在节点上，不处理空白菜单
                debugger
                const target = event.target as HTMLElement;
                if (target.closest('.ant-tree-treenode')) return; // 点到节点不处理
                event.preventDefault();

                setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    items: [
                        { key: 'addGroup', label: 'Add Group' },
                        { key: 'expandAll', label: 'Expand All' },
                        { key: 'collapseAll', label: 'Collapse All' },
                    ],
                    node: undefined, // 空白区域没有节点
                });
            }}
            onClick={(event) => {
                debugger
                const target = event.target as HTMLElement;
                // 点到 Tree 节点或工具栏不清空
                if (target.closest('.ant-tree-treenode') || target.closest('.ant-space')) return;
               
                // 清空选中
                props.clearSelect?.();
            }}
        >
            <div style={{ flexShrink: 0 }}>
                <Space>
                    <Tooltip title={t("layer.addGroup")}> <Button type="text" icon={<FolderAddOutlined />} onClick={props.onAddGroup} shape="circle" size="small" />
                    </Tooltip>
                    <Tooltip title={t("layer.manageThemes")}>
                        <Dropdown menu={menu} trigger={['click']}>
                            <Button type="text" icon={<EyeOutlined />} shape="circle" size="small" />
                        </Dropdown>

                    </Tooltip>
                    <Tooltip title={t("layer.expandAll")}> <Button type="text" icon={<PlusSquareOutlined onClick={props.onExpandAll} />} shape="circle" size="small" />
                    </Tooltip>
                    <Tooltip title={t("layer.collapseAll")}> <Button type="text" icon={<MinusSquareOutlined onClick={props.onCollapseAll} />} shape="circle" size="small" />
                    </Tooltip>
                    <Tooltip title={t("layer.removeGroup")}>
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
                rootStyle={{ flex: 1, overflow: 'auto' }}
                titleRender={tileRender}
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
                onRightClick={handleRightClick}
            />

            {/* 自定义右键菜单 */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        zIndex: 1000,
                        background: '#fff',
                        border: '1px solid #ccc',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    <Menu
                        items={contextMenu.items}
                        onClick={handleContextMenuClick}
                        selectable={false}
                    />
                </div>
            )}
        </div>
    )
}
