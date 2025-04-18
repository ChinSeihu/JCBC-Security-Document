"use client"

import { useEffect, useState } from 'react';
import { get } from '@/lib';
import { App, Badge, Button, Card, Flex, List } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { operateBtnProperty, primaryColor, SCORE_LINE } from '@/constants';
import ViewModal from './ViewModal';
import QuestionDrawer from '@/components/QuestionDrawer';

export default function PDFViewList() {
    const { message } = App.useApp();
    const [docList, setDocList] = useState<any>(new Array(4).fill({}));
    const [loading, setLoading] = useState(false)
    const [openView, setOpenView] = useState(false)
    const [openTest, setOpenTest] = useState(false)
    const [documentId, setDocId] = useState('')
    const [history, setHistory] = useState<any>([])
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
      getFileInfoList()
      getTestHistoryList()
    }, [refresh])
  
      const getFileInfoList = async () => {
      setLoading(true)
          try {
            const response = await get('/api/document/list', { isPublic: 'open', pageSize: 9999 });
            setDocList(response.data)
            return response;
          } catch (error: any) {
            console.log(error, "error>>>>")
            message.error(error.message);
          } finally {
        setLoading(false)
      }
    }

    const getTestHistoryList = async () => {
      try {
        const response = await get('/api/test/history', { pageSize: 9999 });
        console.log(response, 'history')
        setHistory(response.data)
        return response;
      } catch (error: any) {
        console.log(error, "error>>>>")
        message.error(error.message);
      }
    }

    const hancleOpenDoc = (item: any) => {
      setOpenView(true)
      setDocId(item.id)
    }
    const hancleOpenTest = (item: any) => {
      setOpenTest(true)
      setDocId(item.id)
    }

    const handleTestCancel = (shoudRefresh: boolean) => {
      console.log('handleTestCancel')
      setOpenTest(false)
      setDocId('')
      if (shoudRefresh) setRefresh(!refresh)
    }

    const handleViewCancel = () => {
      setOpenView(false)
      setDocId('')
    }
  
    return (
      <Flex gap="middle" vertical>
        <Flex vertical>
        <List
          size="small"
          header={<div>公開中のドキュメント</div>}
          // footer={<div>Footer</div>}
          bordered
          dataSource={docList}
          renderItem={(item: any, idx) => {
            const currentHistory = history.find((it: any) => it.documentId === item.id)
            const isPass = currentHistory?.testStatus?.isCompleted && currentHistory.score === SCORE_LINE;
            return (
              <List.Item>
                  <Card
                    loading={loading}
                    key={idx} 
                    hoverable
                    size='small'
                    title={
                      <Flex align="center">
                        <FileTextOutlined style={{ color: primaryColor, marginRight: 4 }}/>
                        <span style={{ textOverflow: 'ellipsis', width: '92%', overflow: 'hidden', display:'inline-block' }}>{item?.fileName}</span>
                      </Flex>
                    } 
                    extra={[
                      <Button 
                        onClick={() => hancleOpenDoc(item)} 
                        disabled={loading} 
                        size="small" 
                        key="view"
                        style={{ marginLeft: 12 }} 
                        { ...operateBtnProperty }
                      >閲覧</Button>,
                      <Button 
                        key="test"
                        onClick={() => hancleOpenTest(item)} 
                        disabled={loading} 
                        size="small" 
                        style={{ marginLeft: 12 }} 
                        { ...operateBtnProperty }
                      >受験</Button>
                    ]} 
                    style={{ width: '100%' }}
                  >        
                    {currentHistory?.testStatus?.isCompleted ? (
                      <Badge.Ribbon 
                        color={isPass ? "green" : "red"} 
                        style={{ display: 'node', marginRight: '-12px', marginTop: "-5px" }} 
                        text={isPass ? '合格' : '未合格'}
                      >
                        {item.description}
                      </Badge.Ribbon>)
                      : item.description
                    }
                  </Card>
              </List.Item>
            )}}
        />
        </Flex>
        <ViewModal isOpen={openView} onCancel={handleViewCancel} documentId={documentId}/>
        <QuestionDrawer 
            onCancel={handleTestCancel} 
            isOpen={openTest} 
            documentId={documentId} 
            setOpen={setOpenTest}
        />
      </Flex>
    )
  }