import { useEffect, useMemo, useState } from 'react';
import { get, postJson } from '@/lib';
import { App, Button , List, Result,  Row,  Space,  Spin, Tag, Typography } from 'antd';
import Style from './style.module.css'
import { IQuizResultResponse } from '@/app/api/quiz/result/server';
import { CheckCircleFilled, CloseCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const QuizResult = (props: any) => {
  const { documentId, onReTest } = props
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

  const wrongQues = useMemo(() => 
    quizResult?.quizAnswers?.filter(it => it?.selectedInfos?.some?.((op: any) => !op.isCorrect))
  , [quizResult])

	return (
    <Spin spinning={loading}>
      <RenderResult onReTest={onReTest} documentId={documentId} isPass={isPass} quizResult={quizResult} wrongQues={wrongQues as any[]}/>
      <List
        itemLayout="horizontal"
        bordered
        size="small"
        dataSource={wrongQues}
        locale={{ emptyText: "すべての質問に正解して、おめでとうございます。"}}
        renderItem={(item, index: number) => 
          <List.Item key={index} className={Style["list-item"]}>
            <Row><Typography.Text style={{textAlign: 'left'}}>{item.questionText}</Typography.Text></Row>
            {getWrongOptions(item.selectedInfos).map((it, idx) => (
              <Space className={Style["answer-option"]} key={idx}>
                <Typography.Text type="danger">あなたの回答：</Typography.Text>
                <Typography.Text type="danger">{it.content}</Typography.Text>
              </Space>
            ))}
          </List.Item>
        }
      />
    </Spin>
	);
};



const RenderResult = (props: {
  isPass: boolean;
  onReTest: () => void;
  quizResult?: IQuizResultResponse;
  documentId: string;
  wrongQues: any[]
}) => {
  const { isPass, onReTest, quizResult, wrongQues, documentId } = props
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleRetest = async () => {
    try {
      setLoading(true);
      const response = await postJson('/api/quiz/reTest', {
        documentId
      })
      message.success(response?.message || "回答に成功しました")
      onReTest?.()
    } catch (e: any) {
      message.error(e?.message)
    }
    setLoading(false);
  }

  return (
    <Spin spinning={loading}>
      <Result
        status={isPass ? "success" : "error"}
        className={Style["result-container"]}
        title={
        <Typography.Title level={5} style={{ textAlign: 'left'}}>
          {isPass ? <CheckCircleFilled style={{ color: "#52c41a"}}/> : <CloseCircleFilled style={{ color: "red"}} /> } テストの結果が出ていました！
        </Typography.Title>}
        subTitle={
          <div style={{textAlign: 'left'}}>
            今回のテストの正解率: <Tag bordered={false} color='success'>{((quizResult?.score || 0) * 100).toFixed(2)}%</Tag>
            ({(quizResult?.totalQuestions || 0) - (wrongQues?.length || 0)}/{quizResult?.totalQuestions})<br/>
            提出時間: <Tag bordered={false} color='default'>{dayjs(quizResult?.completedAt).format('YYYY-MM-DD HH:mm:ss')}</Tag> 
          </div>
        }
        icon={null}
        extra={(
          <span>
          {!isPass && 
            <Button 
              type="primary" 
              size="small" 
              style={{fontSize: 12}} 
              onClick={handleRetest}
            >再テスト</Button>}
          </span>
          )}
      >
      </Result>
    </Spin>
  )
}


export default QuizResult;