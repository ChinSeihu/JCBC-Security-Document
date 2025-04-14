import { useEffect, useState } from 'react';
import { get, postJson } from '@/lib';
import { App, Button, Checkbox, Drawer, Form, FormInstance, List, Radio, Row, Space, Spin, Typography } from 'antd';
import Style from './style.module.css'
import { QUESTION_TYPE_EUNM } from '@/constants';
import QuizResult from '../QuizResult';

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

interface ITestStatus {
  id: string;
  isCompleted: boolean;
}

interface IProps {
  documentId: string;
  isOpen: boolean;
  setOpen: (p: boolean) => void;
  testStatus: ITestStatus;
  onCancel?: () => void;
}

const QuestionDrawer = (props: IProps) => {
  const { documentId, isOpen, setOpen, testStatus } = props
  const [questionList, setQuestionList] = useState<any>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false)
  const [isCompleted, setCompleted] = useState(testStatus.isCompleted);
  const { message } = App.useApp();

  useEffect(() => {
    setCompleted(testStatus.isCompleted)
  }, [testStatus.isCompleted])

	useEffect(() => {
    if (documentId) getQuestionList()
	}, [documentId])

  const getQuestionList = async () => {
    try {
      setLoading(true);
      const response = await get('/api/quiz/listOfDocument', { documentId });
      console.log(response, 'getQuestionList')
      const queslist = response?.data?.sort(() => Math.random() - 0.5)
      setQuestionList(queslist || []);
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    setLoading(false)
  }

	const onClose = () => {
		setOpen(false);
		props?.onCancel?.();
	  };

  const handleSubmitAswer = async (values: any) => {
    try {
      setSendLoading(true);
      values?.questions?.forEach((it: any) => it.answer = Array.isArray(it.answer) ? it.answer : [it.answer])
      const response = await postJson('/api/quiz/submitAwser', {
        aswerList: values.questions,
        documentId
      })
      message.success(response?.message || "回答に成功しました")
      setCompleted(true);
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
      console.log(e)
    })
  }

  const handleReTest = () => {
    setCompleted(false);
    getQuestionList()
  }

	return (
  <Drawer
    title={<span style={{ float: 'left'}}>テスト</span>}
    width={450}
    mask={false}
    onClose={onClose}
    // placement="bottom"
    getContainer={() => document.getElementsByClassName("document-view-draw-container")[0]}
    open={isOpen}
    extra={
      !isCompleted && <Space>
        <Button onClick={onClose}>キャンセル</Button>
        <Button 
          loading={sendLoading} 
          onClick={handleSubmit} 
          type="primary"
          disabled={!questionList?.length}  
        >送信</Button>
      </Space>
    }
  >
    <Spin spinning={loading}>
    {isCompleted 
      ? <QuizResult documentId={documentId} onReTest={handleReTest}/> 
      : <RenderTestForm disabled={sendLoading} questionList={questionList} form={form}/>
    }
    </Spin>
  </Drawer>
	);
};

const RenderTestForm = ({
   form, questionList, disabled 
  }: {
    form: FormInstance<any>, questionList: any[], disabled: boolean
  }) => {
  return (
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
                    ? <RenderMultiple disabled={disabled} quesOptions={quesOptions} />
                    : <RenderSingle disabled={disabled} quesOptions={quesOptions} />
                  }
                </Form.Item>
              </>
            )}
            </Form.List>
          </List.Item>
        }
      />
    </Form>
  )
}


interface ISelectOptionProp {
  quesOptions: any[];
  onChange?: () => void;
  disabled: boolean;
}
const RenderMultiple = (props: ISelectOptionProp) => {
  const { quesOptions, onChange, disabled } = props
  // quesOptions.sort(() => Math.random() - 0.5)

  return (
    <Checkbox.Group style={style} onChange={onChange} disabled={disabled}>
      {
        quesOptions.map((it: any, idx: number) => (
        <Form.Item noStyle key={idx}>
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

const RenderSingle = (props: ISelectOptionProp) => {
  const { quesOptions, onChange, disabled } = props
  // quesOptions.sort(() => Math.random() - 0.5)

  return (
    <Radio.Group optionType="button" style={style} onChange={onChange} disabled={disabled}>
      {
        quesOptions.map((it: any, idx: number) => (
        <Form.Item noStyle key={idx}>
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