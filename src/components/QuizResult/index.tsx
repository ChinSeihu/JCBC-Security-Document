import { useEffect, useState } from 'react';
import { get } from '@/lib';
import { App, Button , List, Result,  Row,  Space,  Spin, Typography } from 'antd';
import Style from './style.module.css'
import { IQuizResultResponse } from '@/app/api/quiz/result/server';

const QuizResult = (props: any) => {
  const { documentId } = props
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const [quizResult, setQuizResult] = useState<IQuizResultResponse>()

  const getQuizResult = async () => {
    try {
      setLoading(true);
      const response = await get('/api/quiz/result', { documentId });
      console.log(response, 'getQuizResult')
      setQuizResult(response?.quizResultInfo || []);
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    setLoading(false)
  }

  useEffect(() => {
    if (documentId) getQuizResult();
  }, [documentId])

  const isPass = !!quizResult?.score && quizResult?.score > 0.8

  const getWrongOptions = (list: any[]) => {
    return list.filter(it => !it.isCorrect)
  } 

  const getWrongQues = (list: any[] = []) => {
    return list?.filter(it => it?.selectedInfos?.some?.((op: any) => !op.isCorrect))
  }
  

  console.log(quizResult, 'quizResult>>>>>>')

	return (
    <Spin spinning={loading}>
      <Result
        status={isPass ? "success" : "error"}
        title="テストの結果が出ていました！"
        subTitle="Please check and modify the following information before resubmitting."
        extra={(
          <>
          {!isPass && <Button type="primary">再テスト</Button>}
          <Button onClick={getQuizResult}>リフレッシュ</Button>
          </>
          )}
      >
      </Result>
        <List
          itemLayout="horizontal"
          bordered
          dataSource={getWrongQues(quizResult?.quizAnswers)}
          // locale={}
          renderItem={(item, index: number) => 
            <List.Item key={index} style={{ display: 'block' }}>
              <Row><Typography.Text style={{textAlign: 'left'}}>{item.questionText}</Typography.Text></Row>
              {getWrongOptions(item.selectedInfos).map((it) => (
                <Space style={{ width: '100%', marginTop: 4 }}>
                  <Typography.Text type="danger">{String.fromCharCode(65 + it.order)}</Typography.Text>
                  <Typography.Text style={{textAlign: 'left'}} type="danger">{it.content}</Typography.Text>
                </Space>
              ))}
            </List.Item>
          }
        />
    </Spin>
	);
};


export default QuizResult;