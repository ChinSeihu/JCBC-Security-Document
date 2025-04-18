import { useEffect, useState } from 'react';
import { get, postJson } from '@/lib';
import { App, Checkbox, Form, FormInstance, List, Modal, Radio, Row, Spin, Typography } from 'antd';
import Style from './style.module.css'
import { QUESTION_CODE_EUNM } from '@/constants';
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
  onCancel?: (refresh: boolean) => void;
}

const QuestionDrawer = (props: IProps) => {
  const { documentId } = props
  const [open, setOpen] = useState(false);
  const [questionList, setQuestionList] = useState<any>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false)
  const [isCompleted, setCompleted] = useState(false);
  const [fileInfo, setFileInfo] = useState<any>({});
  const [refresh, setRefresh] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    setOpen(props.isOpen)
    props.isOpen && getFileInfo(props.documentId)
    if (props.documentId) getQuestionList(props.documentId)
  }, [props])

  const getFileInfo = async (documentId: string) => {
    try {
      setLoading(true)
      const fileResponse = await get('/api/document/fileInfo', { documentId })
      setFileInfo(fileResponse)
    } catch (e: any) {
      message.error(e?.message)
    } 
    setLoading(false)
  }
  console.log(isCompleted, fileInfo, '<<<<<<<<<<<isCompleted')
  useEffect(() => {
    if (fileInfo?.testStatus) setCompleted(fileInfo?.testStatus?.isCompleted)
  }, [fileInfo])

  const getQuestionList = async (documentId: string) => {
    try {
      setLoading(true);
      const response = await get('/api/quiz/listOfDocument', { documentId });
      console.log(response, 'getQuestionList')
      const queslist = response?.data?.sort(() => Math.random() - 0.5)
      queslist.forEach((it: any) => it.quesOptions = it.quesOptions.sort(() => Math.random() - 0.5))
      setQuestionList(queslist || []);
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    setLoading(false)
  }

	const onClose = () => {
    console.log(props)
		props?.onCancel?.(refresh);
    form.resetFields();
    setCompleted(false)
    setFileInfo({})
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
      setRefresh(true)
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
    getQuestionList(documentId)
  }

	return (
  <Modal
    title={<span>テスト</span>}
    width={750}
    okText="送信"
    destroyOnClose
    maskClosable={false}
    loading={loading}
    okButtonProps={{ hidden: !questionList.length || isCompleted}}
    onCancel={onClose}
    open={open}
    confirmLoading={sendLoading}
    onOk={handleSubmit}
  >
    <Spin spinning={loading || sendLoading}>
    {isCompleted 
      ? <QuizResult documentId={documentId} onReTest={handleReTest}/> 
      : <RenderTestForm disabled={sendLoading} questionList={questionList} form={form}/>
    }
    </Spin>
  </Modal>
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
                    questionType === QUESTION_CODE_EUNM.MULTIPLE_CHOICE 
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
  
  return (
    <Checkbox.Group style={style} onChange={onChange} disabled={disabled}>
      {
        quesOptions.map((it: any, idx: number) => (
        <Form.Item noStyle key={idx}>
          <Row gutter={8} style={{flexWrap: 'nowrap'}}>
            <Checkbox style={{ borderRadius: '50%'}} className={Style["radio-option"]} value={it.order}>
              {String.fromCharCode(65 + idx)}
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

  return (
    <Radio.Group optionType="button" style={style} onChange={onChange} disabled={disabled}>
      {
        quesOptions.map((it: any, idx: number) => (
        <Form.Item noStyle key={idx}>
          <Row gutter={8} style={{flexWrap: 'nowrap'}}>
            <Radio.Button style={{ borderRadius: '50%'}} className={Style["radio-option"]} value={it.order}>
              {String.fromCharCode(65 + idx)}
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