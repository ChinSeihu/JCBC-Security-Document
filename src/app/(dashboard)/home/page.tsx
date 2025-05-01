"use client"

import { operateBtnProperty, primaryColor } from "@/constants";
import { get } from "@/lib";
import { FileTextOutlined } from "@ant-design/icons";
import { App, Button, Card, Flex, List, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const HomePage = () => {
	console.log('HomePage.......')
	const { message } = App.useApp();
	const [docList, setDocList] = useState<any>(new Array(1).fill({}));
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getFileInfoList()
  }, [])

	const getFileInfoList = async () => {
    setLoading(true)
		try {
		  const response = await get('/api/document/viewList');
      setDocList(response)
		  return response;
		} catch (error: any) {
		  console.log(error, "error>>>>")
		  message.error(error.message);
		} finally {
      setLoading(false)
    }
  }

  const handleToView = () => {
    router.push('/document/view')
  } 

	return (
    <Flex gap="middle" vertical>
      <Flex>
        <div>WELCOME!</div>
      </Flex>
      <Flex vertical style={{width: '44%'}}>
      <List
        size="small"
        header={<div>テスト情報</div>}
        // footer={<div>Footer</div>}
        bordered
        dataSource={docList}
        renderItem={(item: any, idx) => {
          const deadlineDiff = dayjs(item?.deadline).diff(dayjs());
          
          return (
            <List.Item>
              <Card 
                loading={loading}
                key={idx} 
                hoverable
                size="small"
                onClick={handleToView}
                title={
                  <Flex align="center">
                    <FileTextOutlined style={{ color: primaryColor, marginRight: 4 }}/>
                    <span style={{ textOverflow: 'ellipsis', width: '92%', overflow: 'hidden', display:'inline-block' }}>{item?.fileName}</span>
                  </Flex>
                } 
                extra={
                  <Button disabled={loading} size="small" style={{ marginLeft: 12 }} { ...operateBtnProperty } onClick={handleToView}>閲覧</Button>
                } 
                style={{ width: '100%' }}
                actions={[
                  <div key="deadline" style={{ textAlign: 'start', padding: '0 12px', fontSize: 12}}>
                    受験期限：
                    <Tag bordered={false} color={deadlineDiff < 86400000 * 3 ? "error" : "blue"}>
                      {item?.deadline ? dayjs(item?.deadline).format('YYYY-MM-DD HH:mm:ss') : '期限無し'}
                    </Tag>
                    までに完了してください
                  </div>
                ]}
              >
                {item.description}
              </Card>
            </List.Item>)}
        }
      />
        {/* {docList.map((it: any, idx: number) => (
          
        ))} */}
      </Flex>
    </Flex>
	);
};

export default HomePage;
