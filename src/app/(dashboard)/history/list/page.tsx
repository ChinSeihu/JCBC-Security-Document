"use client"
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Button, Popconfirm, Table, Tag, Typography, PaginationProps, Badge } from 'antd';
import { TPagination } from '@/constants/type'
import {  isPass, operateBtnProperty, QUESTION_TYPE } from '@/constants';

import Style from './style.module.css';

const initPagination: TPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  showSizeChanger: true,
}

const TestResult = ({ point }: {point: number}) => {
  const isPassed = isPass(point)
  const colorMap = {
    passing: '#87d068',
    failed: '#f50'
  }
  return <Tag color={isPassed ? colorMap.passing : colorMap.failed}>{isPassed ? '合格': '不合格'}</Tag>
}

const TestHistoryList = () => {
  const [tableLoading, seTableLoading] = useState(false);
  const [resultList, setResultList] = useState([]);
  const [pagination, setPagination] = useState<TPagination>(initPagination);
	const { message } = App.useApp();

  const getTestHistoryList = async (page: number = 1, pageSize: number = pagination.pageSize) => {
    try {
      seTableLoading(true);
      const response = await get('/api/test/history', { page, pageSize });
      console.log(response, 'history')
      setResultList(response?.data || []);
      setPagination({...pagination, ...(response?.pagination || {})});
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    seTableLoading(false)
  }

  useEffect(() => {
    getTestHistoryList();
  }, [])
  
  const handleOperation = async (record: any) => {
    try {
      const { success, message: msg} = await postJson('/api/document/statusUpdate', {
        id: record.id,
      })
      
      console.log(success, msg, 'handleOperation')

      if (success) {
        getTestHistoryList();
        return message.success(msg)
      }
      message.warning(msg)
    } catch (e: any) {
      message.error(e?.message)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: '',
      key: 'id',
      width: 40,
      render: (_:any, __:any, index: number) => (pagination.page - 1) * pagination.pageSize + index + 1
    },
    {
      title: '関連ドキュメント',
      dataIndex: 'document',
      key: 'document',
      // className: 'fileName-cell',
      ellipsis: true,
      render: (document: any) => document.fileName
    },
    {
      title: '公開状態',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (_:any, r: any) => <Badge status={r.document.isPublic ? 'success' : 'default'} text={r.document.isPublic ? '公開中' : '未公開'}/>
    },
    {
      title: '正解/総計',
      dataIndex: 'correctAnswers',
      key: 'correctAnswers',
      render: (v: number, record: any) => <Tag>{v}/{record.totalQuestions}</Tag>
    },
    {
      title: 'テスト結果',
      dataIndex: 'score',
      key: 'score',
      render: (v: number) => <TestResult point={v}/>
    },
    {
      title: '実施日時',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 150,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      dataIndex: 'operate',
      // fixed: 'right',
      key: 'operate',
      width: 160,
      render: (_: string, r: any) => (
        <div>
          <Popconfirm
            title="再テスト実施"
            description="再テストを実施しますか?"
            onConfirm={() => {handleOperation(r)}}
            onCancel={() => {}}
            okText="はい"
            cancelText="キャンセル"
          >
            {r?.document?.isPublic && <Button {...operateBtnProperty} type='primary' style={{marginRight: 6 }} size='small'>再テスト</Button>}
          </Popconfirm>
        </div>
      )
    },
  ];

  return (
    <div className="container">
      <Table 
        // title={() => <Typography.Title level={5}>テスト結果一覧</Typography.Title>}
        rowKey="id" 
        dataSource={resultList} 
        columns={columns}
        pagination={{ ...pagination, onChange: (page, pageSize) => getTestHistoryList(page, pageSize)}}
        loading={tableLoading}
        bordered
        size='small'
      />
    </div>
  );
};

export default TestHistoryList;