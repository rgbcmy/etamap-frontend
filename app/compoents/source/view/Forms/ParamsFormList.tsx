import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import set from "lodash/set";

type ParamItem = {
  key: string;
  type: "string" | "number" | "boolean" | "json";
  value: any;
  children?: ParamItem[];
};

type ParamsFormListProps = {
  form: FormInstance;
  name: (string | number)[];
  label?: string;
};

export default function ParamsFormList({ form, name, label }: ParamsFormListProps) {
  const [mode, setMode] = useState<"list" | "json">("list");
  const [jsonValue, setJsonValue] = useState("{}");
  const [listKey, setListKey] = useState(0);

  // ---------------- 类型转换 ----------------
  const parseValueWithType = (type: string, raw: any) => {
    switch (type) {
      case "number": return Number(raw);
      case "boolean": return !!raw;
      case "json": try { return JSON.parse(raw); } catch { return raw; }
      default: return raw?.toString?.() ?? raw;
    }
  };

  // ---------------- 列表 <-> 对象 ----------------
  const listToObject = (list: ParamItem[]): Record<string, any> => {
    const obj: Record<string, any> = {};
    list.forEach(({ key, type = "string", value, children }) => {
      if (!key) return;
      if (children && children.length) obj[key] = listToObject(children);
      else obj[key] = parseValueWithType(type, value);
    });
    return obj;
  };

  const objectToList = (obj: Record<string, any>): ParamItem[] =>
    Object.entries(obj).map(([key, val]) => {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        return { key, type: "json", value: JSON.stringify(val), children: objectToList(val) || [] };
      } else if (typeof val === "number") return { key, type: "number", value: val };
      else if (typeof val === "boolean") return { key, type: "boolean", value: val };
      else return { key, type: "string", value: val };
    });

  // ---------------- 同步 Form <-> JSON ----------------
  const updateJsonFromList = (listData: ParamItem[]) => {
    const obj = listToObject(listData);
    setJsonValue(JSON.stringify(obj, null, 2));
    form.setFieldsValue({ [name.join(".")]: obj });
  };

  const updateListFromJson = (obj: Record<string, any>) => {
    const listData = objectToList(obj);
    form.setFieldsValue({ paramsList: listData, [name.join(".")]: obj });
    setListKey(prev => prev + 1);
  };

  // ---------------- 初始化 ----------------
  useEffect(() => {
    const initial = form.getFieldValue(name) || {};
    updateListFromJson(initial);
  }, [form, name]);

  // ---------------- JSON模式变化 ----------------
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonValue(val);
    try {
      const obj = JSON.parse(val);
      updateListFromJson(obj);
    } catch { }
  };

  // ---------------- 渲染列表递归 ----------------
  const renderList = (fields: any[], parentPath: (string | number)[] = []) => {
    return fields.map(field => {
      const fieldPath = [...parentPath, field.name];

      return (
        <div key={field.key} style={{ marginBottom: 8, border: "1px solid #eee", padding: 8, borderRadius: 4 }}>
          <Space align="start">
            {/* 参数名 */}
            <Form.Item
              name={[...fieldPath, "key"]}
              rules={[{ required: true }]}
              style={{ width: 120 }}
            >
              <Input placeholder="参数名" />
            </Form.Item>

            {/* 类型 */}
            <Form.Item
              name={[...fieldPath, "type"]}
              initialValue="string"
              style={{ width: 100 }}
            >
              <Select
                options={[
                  { label: "字符串", value: "string" },
                  { label: "数字", value: "number" },
                  { label: "布尔值", value: "boolean" },
                  { label: "JSON", value: "json" },
                ]}
              />
            </Form.Item>

            {/* 值 */}
            <Form.Item noStyle shouldUpdate>
              {() => {
                const type = form.getFieldValue([...fieldPath, "type"]);
                if (type === "boolean") {
                  return (
                    <Form.Item name={[...fieldPath, "value"]} style={{ width: 100 }}>
                      <Select options={[{ label: "true", value: true }, { label: "false", value: false }]} />
                    </Form.Item>
                  );
                }
                if (type === "number") {
                  return (
                    <Form.Item name={[...fieldPath, "value"]} style={{ width: 120 }}>
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  );
                }
                if (type === "json") {
                  return (
                    <Form.Item name={[...fieldPath, "value"]} style={{ width: 200 }}>
                      <Input.TextArea rows={2} placeholder='{"key":value}' />
                    </Form.Item>
                  );
                }
                return (
                  <Form.Item name={[...fieldPath, "value"]} style={{ width: 200 }}>
                    <Input placeholder="字符串值" />
                  </Form.Item>
                );
              }}
            </Form.Item>

            {/* 删除按钮 */}
            <MinusCircleOutlined
              onClick={() => {
                const parentList = parentPath.length === 0 ? ["paramsList"] : parentPath.concat("children");
                const list: any[] = form.getFieldValue(parentList) || [];
                list.splice(field.name, 1);

                const values: any = {};
                set(values, parentList, list);
                form.setFieldsValue(values);

                updateJsonFromList(form.getFieldValue(["paramsList"]) || []);
              }}
              style={{ marginTop: 6 }}
            />
          </Space>

          {/* 子列表 */}
          <Form.List name={[...fieldPath, "children"]}>
            {(childFields) => (
              <div style={{ marginLeft: 32, marginTop: 8 }}>
                {renderList(childFields, fieldPath)}

                <Button
                  type="dashed"
                  onClick={() => {
                    const childrenList = form.getFieldValue([...fieldPath, "children"]) || [];
                    childrenList.push({ key: "", type: "string", value: "" });

                    const values: any = {};
                    set(values, fieldPath.concat("children"), childrenList);
                    form.setFieldsValue(values);

                    updateJsonFromList(form.getFieldValue(["paramsList"]) || []);
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  添加子参数
                </Button>
              </div>
            )}
          </Form.List>
        </div>
      );
    });
  };

  return (
    <>
      <Button size="small" onClick={() => setMode(mode === "list" ? "json" : "list")} style={{ marginBottom: 8 }}>
        切换为 {mode === "list" ? "JSON" : "列表"} 模式
      </Button>

      {mode === "list" && (
        <Form.Item label={label} style={{ marginBottom: 0 }}>
          <Form.List key={listKey} name={["paramsList"]}>
            {(fields) => renderList(fields)}
          </Form.List>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const listData = form.getFieldValue("paramsList") || [];
              updateJsonFromList(listData);
              return null;
            }}
          </Form.Item>
        </Form.Item>
      )}

      {mode === "json" && (
        <Form.Item label="参数 JSON">
          <Input.TextArea value={jsonValue} onChange={handleJsonChange} rows={8} placeholder='{"LAYERS":"topp:states"}' />
        </Form.Item>
      )}
    </>
  );
}
