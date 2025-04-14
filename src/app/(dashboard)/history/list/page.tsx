"use client"
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Button, Popconfirm, Tag, Typography, Badge } from 'antd';
import { TPagination } from '@/constants/type'
import {  isPass, operateBtnProperty, PUBLIC_STATUS_ENUM, publicEnum, resultOption } from '@/constants';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';

import './style.module.css';

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
  const [pagination, setPagination] = useState<TPagination>(initPagination);
	const { message } = App.useApp();
  const actionRef = useRef<ActionType>();

  const getTestHistoryList = async (params = {}) => {
    try {
      const response = await get('/api/test/history', {
        page: initPagination.page,
        pageSize: pagination.pageSize,
        ...params,
      });
      console.log(response, 'history')
      return response;
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
  }

  useEffect(() => {
    getTestHistoryList();
  }, [])
  
  const handleOperation = async (record: any) => {
    try {
      if (!record?.userId) throw new Error('ユーザーIDが見つかりませんでした！')
      const { success, message: msg} = await postJson('/api/quiz/reTest', {
        userId: record?.userId,
        documentId: record.document.id
      })
      
      if (success) {
        actionRef.current?.reload();
        return message.success(msg)
      }
      message.warning(msg)
    } catch (e: any) {
      message.error(e?.message)
    }
  }

  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 40,
      hideInSearch: true,
      render: (_:any, __:any, index: number) => (pagination.page - 1) * pagination.pageSize + index + 1
    },
    {
      title: '関連ドキュメント',
      dataIndex: 'document',
      valueType: 'text',
      ellipsis: true,
      formItemProps: { label: 'ドキュメント' },
      render: (_,record) => record?.document?.fileName || '-'
    },
    {
      title: '公開状態',
      dataIndex: 'isPublic',
      valueEnum: publicEnum,
      render: (_:any, r: any) => <Badge status={r.document.isPublic ? 'success' : 'default'} text={r.document.isPublic ? '公開中' : '未公開'}/>
    },
    {
      title: '正解/総計',
      dataIndex: 'correctAnswers',
      hideInSearch: true,
      render: (v, record: any) => <Tag>{v}/{record.totalQuestions}</Tag>
    },
    {
      title: 'テスト結果',
      dataIndex: 'score',
      valueType: 'select',
      fieldProps: { options: resultOption },
      render: (_, record) => <TestResult point={record.score}/>
    },
    {
      title: '実施日時',
      dataIndex: 'completedAt',
      valueType: 'dateRange',
      search: {
        transform: (dates) => ({startDate: dates[0], endDate: dates[1] })
      },
      width: 150,
      render: (_, record) => dayjs(record.completedAt).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      dataIndex: 'operate',
      // fixed: 'right',
      valueType: 'option',
      width: 100,
      render: (_, r: any) => (
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
      <ProTable
        rowKey="idx" 
        actionRef={actionRef}
        cardBordered
        request={async (params, sorter, filter) => {
          console.log(params, sorter, filter);
          const { pagination: resPagination, data } = await getTestHistoryList({
            ...params,
            page: params.current
          }) || {}
          setPagination({...pagination, ...(resPagination || {})})
          return ({
            data: data || [],
            success: true,
            total: resPagination?.total || 0
          });
        }}
        columns={columns}
        search={{
          labelWidth: 95,
          span: 8,
        }}
        pagination={{ ...pagination }}
        bordered
        defaultSize='small'
        headerTitle={<Typography.Title level={5}>テスト履歴一覧</Typography.Title>}
      />
    </div>
  );
};

export default TestHistoryList;