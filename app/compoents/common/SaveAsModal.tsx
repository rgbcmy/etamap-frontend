import { Modal, Input, Form, message } from "antd";
import { useEffect } from "react";

interface SaveAsModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (filename: string) => void;
  defaultName?: string;
  extension?: string; // 默认扩展名，如 .etm
}

export default function SaveAsModal({
  visible,
  onCancel,
  onConfirm,
  defaultName = "project",
  extension = ".etm",
}: SaveAsModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ filename: defaultName });
    }
  }, [visible]);

  const handleOk = async () => {
    try {
      const { filename } = await form.validateFields();
      const cleanName = filename.trim();
      const finalName = cleanName.endsWith(extension) ? cleanName : `${cleanName}${extension}`;
      onConfirm(finalName);
    } catch (ex:any){
      debugger
      console.error(ex.toString())
      //message.error("请输入有效的文件名");
    }
  };

  return (
    <Modal
      title="另存为"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="文件名"
          name="filename"
          rules={[
            { required: true, message: "文件名不能为空" },
            {
              pattern: /^[^\\/:*?"<>|]+$/,
              message: "文件名不能包含非法字符（\\ / : * ? \" < > |）",
            },
          ]}
        >
          <Input placeholder={`请输入文件名（自动添加 ${extension}）`} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
