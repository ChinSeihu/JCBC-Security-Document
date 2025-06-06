"use client"
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Button, Popconfirm, Tag, Typography, Badge } from 'antd';
import { TPagination } from '@/constants/type'
import {  isPass, operateBtnProperty, PUBLIC_STATUS_ENUM, publicEnum, resultOption } from '@/constants';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';

import Style from './style.module.css';
import { ExportOutlined } from '@ant-design/icons';

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

const TestResultList = () => {
  const [pagination, setPagination] = useState<TPagination>(initPagination);
	const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  
  const getTestResultList = async (params = {}) => {
    try {
      const response = await get('/api/test/resultList', {
        page: initPagination.page,
        pageSize: pagination.pageSize,
        ...params,
      });
      console.log(response, 'resultList')
      return response
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
  }
  
  const handleOperation = async (record: any) => {
    try {
      if (!record?.user?.userId) throw new Error('ユーザーIDが見つかりませんでした！')
      const { success, message: msg} = await postJson('/api/quiz/reTest', {
        userId: record?.user?.userId,
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
      dataIndex: 'idx',
      width: 40,
      hideInSearch: true,
      render: (_, __, index: number) => (pagination.page - 1) * pagination.pageSize + index + 1
    },
    {
      title: '関連ドキュメント',
      dataIndex: 'document',
      valueType: 'text',
      className: Style['fileName-cell'],
      formItemProps: {
        label: 'ドキュメント',
      },
      ellipsis: true,
      render: (_, record) => <a target="_blank" href={record?.document?.pathName}>{record.document.fileName}</a>
    },
    {
      title: '公開状態',
      dataIndex: 'isPublic',
      valueEnum: publicEnum,
      render: (_, r) => <Badge status={r.document.isPublic ? 'success' : 'default'} text={r.document.isPublic ? '公開中' : '未公開'}/>
    },
    {
      title: '正解/総計',
      dataIndex: 'correctAnswers',
      hideInSearch: true,
      render: (v, record) => <Tag>{v}/{record.totalQuestions}</Tag>
    },
    {
      title: 'テスト結果',
      dataIndex: 'score',
      valueType: 'select',
      fieldProps: { options: resultOption },
      render: (_, record) => <TestResult point={record?.score}/>
    },
    {
      title: '受験者',
      dataIndex: 'user',
      renderText: (user) => `${user.firstName} ${user.lastName}`
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
      fixed: 'right',
      valueType: 'option',
      width: 100,
      hideInSearch: true,
      render: (_, r: any) => (
        <div>
          <Popconfirm
            title="再テスト指定"
            description="このユーザに再テスト指定しますか?"
            onConfirm={() => {handleOperation(r)}}
            onCancel={() => {}}
            okText="はい"
            cancelText="キャンセル"
          >
            {r?.document?.isPublic && <Button {...operateBtnProperty} style={{marginRight: 6 }} size='small'>再テスト</Button>}
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
          const { pagination: resPagination, data } = await getTestResultList({
            ...params,
            userName: params.user,
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
        toolbar={{
          actions: ([
            <Button key='export' type="primary" icon={<ExportOutlined />}>
              エクスポート(実装中)
            </Button>
          ]),
        }}
        pagination={{ ...pagination }}
        bordered
        defaultSize='small'
        headerTitle={<Typography.Title level={5}>テスト結果一覧</Typography.Title>}
      />
    </div>
  );
};

export default TestResultList;