import { useEffect, useState } from 'react';
import { get, post, postJson } from '@/lib';
import { App, Button, Checkbox, Divider, Drawer, Empty, Form, Input, List , Modal, Radio, Row, Space, Spin, Tag, Typography } from 'antd';
import Style from './style.module.css'
import { QUESTION_TYPE_EUNM } from '@/constants';

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const QuestionDrawer = (props: any) => {
  const { documentId, formRef, isOpen, setOpen } = props
  const [questionList, setQuestionList] = useState<any>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false)
  const { message } = App.useApp();

  useEffect(() => {
    if (formRef?.current) formRef.current.form = form;
  }, [formRef])

	useEffect(() => {
    if (isOpen && !questionList?.length) getQuestionList()
	}, [isOpen, questionList])

  const getQuestionList = async () => {
    try {
      setLoading(true);
      const response = await get('/api/quiz/listOfDocument', { documentId });
      console.log(response, 'getQuestionList')
      setQuestionList(response?.data || []);
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    setLoading(false)
  }


	const handleCancel = () => {
		return Modal.confirm({
			title: 'キャンセル確認',
			content: 'アップロード中のですが、キャンセルしますか？',
			onCancel: () => {},
			onOk: () => {
				setOpen(false);
				props?.onCancel?.();
			}
		})
	}

	const onClose = () => {
		setOpen(false);
		props?.onCancel?.();
	  };

  const handleSubmitAswer = async (values: any) => {
    try {
      setSendLoading(true);
      values?.questions?.forEach((it: any) => {it.answer = String(it.answer?.join?.(',') ?? it.answer)})
      const response = await postJson('/api/quiz/submitAwser', {
        aswerList: values.questions,
        documentId
      })
      message.success(response?.message || "回答に成功しました")
    } catch (e: any) {
      message.error(e?.message)
    }
    setSendLoading(false);
  };

  const handleSubmit = () => {
    console.log(form.getFieldsValue(), 'handleSubmit')
    form.validateFields().then(values => {
      handleSubmitAswer(values)
    }).catch(e => {
      message.error(e?.message)
    })
  }

	return (
  <Drawer
    title={<span style={{ float: 'left'}}>テスト問題</span>}
    width={450}
    mask={false}
    onClose={onClose}
    // placement="bottom"
    getContainer={() => document.getElementsByClassName("document-view-draw-container")[0]}
    open={isOpen}
    extra={
      <Space>
        <Button onClick={onClose}>キャンセル</Button>
        <Button loading={sendLoading} onClick={handleSubmit} type="primary">送信</Button>
      </Space>
    }
  >
    <Spin spinning={loading}>
      <Form form={form}>
        <List
          itemLayout="horizontal"
          // bordered
          dataSource={questionList}
          locale={{
            emptyText: '問題はまだ用意されていない'
          }}
          renderItem={({ content, id, quesOptions = [], questionType}: any, index: number) => 
            <List.Item style={{ display: 'block' }}>
              <Form.List name="questions">
              {() => (
                <>
                  <Form.Item style={{textAlign: 'left'}} initialValue={id} name={[index, "questionId"]} > 
                    <Typography.Text>{index + 1}、{content}</Typography.Text>
                  </Form.Item>
                  <Form.Item name={[index, "answer"]} rules={[{ required: true, message: "この質問をご回答ください" }]}>
                    {
                      questionType === QUESTION_TYPE_EUNM.MULTIPLE_CHOICE 
                      ? <RenderMultiple disabled={sendLoading} quesOptions={quesOptions} />
                      : <RenderSingle disabled={sendLoading} quesOptions={quesOptions} />
                    }
                  </Form.Item>
                </>
              )}
              </Form.List>
            </List.Item>
          }
        />
      </Form>
    </Spin>
  </Drawer>
	);
};


const RenderMultiple = (props: any) => {
  const { quesOptions, onChange, disabled } = props

  return (
    <Checkbox.Group style={style} onChange={onChange} disabled={disabled}>
      {
        quesOptions.map((it: any) => (
        <Form.Item noStyle>
          <Row gutter={8} style={{flexWrap: 'nowrap'}}>
            <Checkbox style={{ borderRadius: '50%'}} className={Style["radio-option"]} value={it.order}>
              {String.fromCharCode(65 + it.order)}
            </Checkbox>
            <Form.Item noStyle>
              <Typography.Text style={{textAlign: 'left', marginLeft: 8}}>{it.content}</Typography.Text>
            </Form.Item>
          </Row>
        </Form.Item>
        ))
      }
    </Checkbox.Group>
  )
}

const RenderSingle = (props: any) => {
  const { quesOptions, onChange, disabled } = props

  return (
    <Radio.Group optionType="button" style={style} onChange={onChange} disabled={disabled}>
      {
        quesOptions.map((it: any) => (
        <Form.Item noStyle>
          <Row gutter={8} style={{flexWrap: 'nowrap'}}>
            <Radio.Button style={{ borderRadius: '50%'}} className={Style["radio-option"]} value={it.order}>
              {String.fromCharCode(65 + it.order)}
            </Radio.Button>
            <Form.Item noStyle>
              <Typography.Text style={{textAlign: 'left', marginLeft: 8}}>{it.content}</Typography.Text>
            </Form.Item>
          </Row>
        </Form.Item>
        ))
      }
    </Radio.Group>
  )
}

export default QuestionDrawer;