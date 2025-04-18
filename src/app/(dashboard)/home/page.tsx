"use client"

import { operateBtnProperty, primaryColor } from "@/constants";
import { get } from "@/lib";
import { FileTextOutlined } from "@ant-design/icons";
import { App, Button, Card, Flex, List, Spin, Typography } from "antd";
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
		  const response = await get('/api/document/list', { isPublic: 'open' });
      setDocList(response.data)
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
        header={<div>公開中のドキュメント</div>}
        // footer={<div>Footer</div>}
        bordered
        dataSource={docList}
        renderItem={(item: any, idx) => 
          <List.Item>
            <Card 
              loading={loading}
              key={idx} 
              hoverable
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
            >
              {item.description}
            </Card>
          </List.Item>}
      />
        {/* {docList.map((it: any, idx: number) => (
          
        ))} */}
      </Flex>
    </Flex>
	);
};

export default HomePage;
