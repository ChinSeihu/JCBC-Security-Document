import { useEffect, useState } from 'react';
import { get, post, postJson } from '@/lib';
import { Button, Modal, Form, Radio, Input, Select, Row, Checkbox, Tag, App, Typography, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Style from './style.module.css'

const requiredRule = (msg: string) => [
  {
    required: true,
    message: `${msg}を入力ください`
  }
];

const QuesFormModal = (props: any) => {
	const [isOpen, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [slectLoading, setSelectLoading] = useState(false);
	const [form] = Form.useForm();
	const [documentList, setDocumentList] = useState([]);
  const { message, modal } = App.useApp();

	const getFileInfoList = async () => {
		try {
      setSelectLoading(true)
		  const response = await get('/api/document/list');
		  console.log(response, 'getFileInfoList')
		  setDocumentList(response?.data || []);
		} catch (error: any) {
		  console.log(error, "error>>>>")
		  message.error(error.message);
		}
    setSelectLoading(false)
  }

  const onCancel = (msg?: string) => {
    setOpen(false);
    form.resetFields();
    props?.onCancel?.(msg);
  }

	const handleCancel = () => {
    return modal.confirm({
      title: 'キャンセル確認',
      content: '入力内容を捨てて、キャンセルしますか？',
      onCancel: () => {},
      okText: 'はい',
      cancelText: 'いいえ',
      onOk: () => onCancel()
    })
	}

	const handleCreateQues = async (valuse: any) => {
    try {
      setLoading(true);
      const response = await postJson('/api/quiz/createQuestion', valuse) 
      console.log(response, 'handleCreateQues>>>>>')
      onCancel(response?.message || '追加に成功しました');
      props?.onSuccess?.();
    } catch(e: any) {
      console.log(e)
      message.error(e?.message)
    }
    setLoading(false);
	}

  const handleSubmit = async () => {
    await form.validateFields().then((values) => {  
      console.log(values, 'handleSubmit')
      const hasCorrect = values?.quesOptions?.some((it: any) => it.isCorrect);
              
      if (!hasCorrect) {
        return message.warning('少なくとも1つの正解項目をチェックインしてください');
      }
      handleCreateQues(values)
    }).catch((error) => {
      console.log(error, 'handleSubmit error')
    });
  }

  useEffect(() => {
		setOpen(props.isOpen);
    if (props.isOpen) getFileInfoList()
	}, [props.isOpen])

	return (
		<Modal
			title="問題新規" 
			cancelText="キャンセル" 
      okText="保存"
			open={isOpen} 
      width={700}
      maskClosable={false}
			onCancel={handleCancel} 
      onOk={handleSubmit}
      okButtonProps={{ loading }}
			destroyOnClose
		>
			<Form
				form={form}
				layout="vertical"
			>
			<Form.Item 
        required 
        label="関連ドキュメント" 
        name="documentId"
        rules={requiredRule('関連ドキュメント')}  
      >
				<Select loading={slectLoading}>
				{documentList.map(({id, fileName}: any) => (
					<Select.Option key={id} value={id}>
            {fileName}
            <Typography.Text type="secondary" className="ml-3 opacity-20">{id}</Typography.Text></Select.Option>
				))}
				</Select>
			</Form.Item>
			<Form.Item rules={requiredRule('問題のタイプ')} label="問題のタイプ" initialValue={"SINGLE_CHOICE"} name="questionType">
				<Radio.Group>
					<Radio.Button value="SINGLE_CHOICE">単一選択</Radio.Button>
					<Radio.Button value="MULTIPLE_CHOICE">多肢選択</Radio.Button>
				</Radio.Group>
			</Form.Item>
			<Form.Item label="問題内容" rules={requiredRule('問題内容')} name="content">
				<Input.TextArea placeholder="問題の内容を入力ください" />
			</Form.Item>
			<Form.Item 
        label="選択肢" 
        rules={requiredRule('選択肢')} 
        tooltip="チェックボックスをチェックインして、正解に設定する"
        name="quesOptions"
        initialValue={[{}]}
      >
        <Form.List
          name="quesOptions"
          rules={[
            {
              validator: async (_, quesOption) => {
                if (!quesOption || quesOption.length < 1) {
                  return Promise.reject(new Error('少なくとも1 つのオプションを追加してください'));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Row key={key} style={{ width: '100%', marginBottom: 8 }}>
                  <Form.Item
                    {...restField}
                    label={<Tag bordered={false} color="default">{String.fromCharCode(65 + index)}</Tag >}
                    required={false}
                    style={{ height: 32 }}
                    name={[name, "order"]}
                    initialValue={index}
                  >
                    <Input hidden/>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    style={{ width: 500}}
                    name={[name, "content"]}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "選択肢の内容を入力ください",
                      },
                    ]}
                  >
                    <Input placeholder="内容を入力ください" style={{ width: '98%', height: 32 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "isCorrect"]}
                    initialValue={false}
                    valuePropName="checked"
                  >
                    <Tooltip title="正解に設定する">
                      <Checkbox />
                    </Tooltip>
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      style={{ height: 32 }}
                      className={Style["dynamic-delete-button"]}
                      onClick={() => remove(name)}
                    />
                  ) : null}
                </Row>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{ width: '60%' }}
                  icon={<PlusOutlined />}
                >
                  選択肢を追加
                </Button>
                {/* <Form.ErrorList errors={errors} /> */}
              </Form.Item>
            </>
          )}
        </Form.List>
			</Form.Item>
			</Form>
		</Modal>
	);
};

export default QuesFormModal;