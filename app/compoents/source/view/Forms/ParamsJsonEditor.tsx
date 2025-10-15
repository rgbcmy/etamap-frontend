import React, { useState, useEffect } from "react";
import { Form, Table, Input, InputNumber, Select, Button, Space } from "antd";
import { PlusOutlined, MinusCircleOutlined, CodeOutlined, TableOutlined } from "@ant-design/icons";

type ParamItem = {
  id: string;
  key: string;
  type: "string" | "number" | "boolean" | "json";
  value: any;
  children: ParamItem[];
};

// ------------------ 工具函数 ------------------
const parseValue = (type: string, value: any) => {
  if (type === "number") return Number(value);
  if (type === "boolean") return value === true || value === "true";
  if (type === "json") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const listToObject = (list: ParamItem[]): Record<string, any> => {
  const obj: Record<string, any> = {};
  list.forEach((item) => {
    if (!item.key) return;
    if (item.children && item.children.length > 0) obj[item.key] = listToObject(item.children);
    else obj[item.key] = parseValue(item.type, item.value);
  });
  return obj;
};

const objectToList = (obj: Record<string, any>): ParamItem[] =>
  Object.entries(obj).map(([key, val]) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return {
        id: Math.random().toString(36).slice(2),
        key,
        type: "json",
        value: JSON.stringify(val, null, 2),
        children: objectToList(val),
      };
    } else if (typeof val === "number") {
      return { id: Math.random().toString(36).slice(2), key, type: "number", value: val, children: [] };
    } else if (typeof val === "boolean") {
      return { id: Math.random().toString(36).slice(2), key, type: "boolean", value: val, children: [] };
    } else {
      return { id: Math.random().toString(36).slice(2), key, type: "string", value: val, children: [] };
    }
  });

const getLevel = (id: string, nodes: ParamItem[], level = 0): number => {
  for (const node of nodes) {
    if (node.id === id) return level;
    if (node.children) {
      const childLevel = getLevel(id, node.children, level + 1);
      if (childLevel !== -1) return childLevel;
    }
  }
  return -1;
};

// ------------------ ParamsJsonEditor ------------------
type ParamsJsonEditorProps = {
  value?: Record<string, any>;
  onChange?: (val: Record<string, any>) => void;
};

const ParamsJsonEditor: React.FC<ParamsJsonEditorProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<"table" | "json">("table");
  const [data, setData] = useState<ParamItem[]>(() => (value ? objectToList(value) : []));
  const [jsonValue, setJsonValue] = useState("{}");

  // --- 父组件 value 改变时同步内部 data（避免无限循环） ---
  useEffect(() => {
    if (!value) return;
    const newData = objectToList(value);
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData);
    }
  }, [value]);

  // --- data 改变时同步 jsonValue 并通知父组件（避免无限循环） ---
  useEffect(() => {
    const obj = listToObject(data);
    const newJson = JSON.stringify(obj, null, 2);
    setJsonValue(newJson);
    if (JSON.stringify(obj) !== JSON.stringify(value)) {
      onChange?.(obj);
    }
  }, [data]);

  const updateFromJson = (text: string) => {
    try {
      const parsed = JSON.parse(text || "{}");
      setData(objectToList(parsed));
    } catch {}
  };

  const updateNode = (id: string, field: keyof ParamItem, value: any) => {
    const update = (list: ParamItem[]): ParamItem[] =>
      list.map((item) => {
        if (item.id === id) return { ...item, [field]: value };
        if (item.children) return { ...item, children: update(item.children) };
        return item;
      });
    setData(update(data));
  };

  const addChild = (record: ParamItem) => {
    const addNode = (nodes: ParamItem[]): ParamItem[] =>
      nodes.map((node) => {
        if (node.id === record.id) {
          const children = node.children ? [...node.children] : [];
          children.push({
            id: Math.random().toString(36).slice(2),
            key: "",
            type: "string",
            value: "",
            children: [],
          });
          return { ...node, children };
        }
        if (node.children) return { ...node, children: addNode(node.children) };
        return node;
      });
    setData(addNode(data));
  };

  const deleteNode = (id: string, nodes: ParamItem[] = data): ParamItem[] =>
    nodes
      .filter((n) => n.id !== id)
      .map((n) => ({ ...n, children: n.children ? deleteNode(id, n.children) : [] }));

  const columns = [
    {
      title: "参数名",
      dataIndex: "key",
      key: "key",
      render: (_: any, record: ParamItem) => {
        const level = getLevel(record.id, data);
        return (
          <Input
            value={record.key}
            placeholder="参数名"
            style={{ paddingLeft: level * 10 }}
            onChange={(e) => updateNode(record.id, "key", e.target.value)}
          />
        );
      },
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (_: any, record: ParamItem) => (
        <Select
          style={{ width: "100%" }}
          value={record.type}
          onChange={(val) => updateNode(record.id, "type", val)}
          options={[
            { label: "字符串", value: "string" },
            { label: "数字", value: "number" },
            { label: "布尔值", value: "boolean" },
            { label: "JSON", value: "json" },
          ]}
        />
      ),
    },
    {
      title: "值",
      dataIndex: "value",
      key: "value",
      render: (_: any, record: ParamItem) => {
        const level = getLevel(record.id, data);
        switch (record.type) {
          case "number":
            return <InputNumber value={record.value} style={{ width: "100%", paddingLeft: level * 10 }} onChange={(val) => updateNode(record.id, "value", val)} />;
          case "boolean":
            return (
              <Select
                value={record.value}
                style={{ width: "100%", paddingLeft: level * 10 }}
                onChange={(val) => updateNode(record.id, "value", val)}
                options={[
                  { label: "true", value: true },
                  { label: "false", value: false },
                ]}
              />
            );
          case "json":
            return (
              <Input.TextArea
                value={record.value}
                style={{ width: "100%", paddingLeft: level * 10 }}
                autoSize={{ minRows: 1, maxRows: 4 }}
                onChange={(e) => updateNode(record.id, "value", e.target.value)}
                placeholder='{"key":value}'
              />
            );
          default:
            return <Input value={record.value} style={{ width: "100%", paddingLeft: level * 10 }} onChange={(e) => updateNode(record.id, "value", e.target.value)} />;
        }
      },
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_: any, record: ParamItem) => (
        <Space>
          <Button size="small" icon={<PlusOutlined />} onClick={() => addChild(record)} />
          <Button size="small" danger icon={<MinusCircleOutlined />} onClick={() => setData(deleteNode(record.id))} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Button
          type="primary"
          icon={mode === "table" ? <CodeOutlined /> : <TableOutlined />}
          onClick={() => setMode(mode === "table" ? "json" : "table")}
        >
          切换为 {mode === "table" ? "JSON" : "表格"} 模式
        </Button>
      </div>

      {mode === "table" ? (
        <>
          <Table
            columns={columns.map((col) =>
              col.key === "actions"
                ? { ...col, fixed: "right" as const, width: 120 }
                : { ...col, width: col.key === "key" ? 200 : col.key === "type" ? 100 : 300 }
            )}
            dataSource={data}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: true }}
            expandable={{
              defaultExpandAllRows: true,
              rowExpandable: (record) => !!record.children?.length,
            }}
          />
          <Button
            type="dashed"
            onClick={() =>
              setData([...data, { id: Math.random().toString(36).slice(2), key: "", type: "string", value: "", children: [] }])
            }
            block
            icon={<PlusOutlined />}
            style={{ marginTop: 8 }}
          >
            添加根参数
          </Button>
        </>
      ) : (
        <Input.TextArea
          rows={12}
          value={jsonValue}
          onChange={(e) => {
            setJsonValue(e.target.value);
            updateFromJson(e.target.value);
          }}
          placeholder='{"LAYERS": "topp:states"}'
        />
      )}
    </div>
  );
};

export default ParamsJsonEditor;
