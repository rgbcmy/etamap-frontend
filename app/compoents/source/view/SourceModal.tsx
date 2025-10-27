import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import SourceFormXYZ from "./Forms/SourceFormXYZ";
import SourceFormWMS from "./Forms/SourceFormTileWMS";
import type { ISource } from "node_modules/openlayers-serializer/dist/dto/source";
import SourceFormWMTS from "./Forms/SourceFornWMTS";

type Props = {
    visible: boolean;
    source?: ISource; // 编辑时传入
    /**
     * 数据源类型
     */
    type: string; // 树节点传入
    onOk: (source: ISource) => void;
    onCancel: () => void;
};

export default function SourceModal({ visible, source, type, onOk, onCancel }: Props) {
    const [form] = Form.useForm();
    debugger
    useEffect(() => {
        if (source) {
            form.setFieldsValue(source);
        } else {
            form.resetFields();
        }
    }, [source, form, visible]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onOk({
                ...values,
                type: type,
                id: source?.id || crypto.randomUUID()//  `${type}-${Date.now()}`,
            });
            form.resetFields();
        });
    };


    const title = `${source ? "编辑" : "新增"} ${type} 数据源`;
    // const type = Form.useWatch("type", form);

    return (
        <Modal
            title={title}
            open={visible}
            onOk={handleOk}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="名称"
                    rules={[{ required: true, message: "请输入名称" }]}
                >
                    <Input />
                </Form.Item>

                {/* <Form.Item
                    name="type"
                    label="类型"
                    rules={[{ required: true, message: "请选择类型" }]}
                >
                    <Select
                        options={[
                            { label: "XYZ 瓦片", value: "xyz" },
                            { label: "矢量", value: "vector" },
                            { label: "WMS", value: "wms" },
                        ]}
                    />
                </Form.Item> */}
                {/*tod 添加其他数据源*/}
                {type === "XYZ" && <SourceFormXYZ form={form} />}
                {type === "TileWMS" && <SourceFormWMS form={form} />}
                {type === "WMTS" && <SourceFormWMTS form={form} />}
            </Form>
        </Modal>
    );
}
