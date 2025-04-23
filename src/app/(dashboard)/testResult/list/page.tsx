"use client"
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Button, Popconfirm, Tag, Typography, Badge } from 'antd';
import { TPagination } from '@/constants/type'
import {  isPass, operateBtnProperty, publicEnum, resultOption } from '@/constants';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';

import Style from './style.module.css';
import { ExportOutlined } from '@ant-design/icons';
import { HttpStatusCode } from 'axios';

const initPagination: TPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  showSizeChanger: true,
}

const TestResult = ({ point, status }: {point?: number, status?: string }) => {
  const isPassed = isPass(point)
  const colorMap = {
    passing: '#87d068',
    failed: '#f50',
    default: ''
  }

  const color = status === 'default' ? colorMap.default : isPassed ? colorMap.passing : colorMap.failed
  const text = status === 'default' ? '未実施' : isPassed ? '合格': '不合格'
  return <Tag color={color}>{text}</Tag>
}

const TestResultList = () => {
  const [pagination, setPagination] = useState<TPagination>(initPagination);
	const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [params, setParams] = useState<any>({})
  const [exportLoading, setExportLoading] = useState(false)
  
  const getTestResultList = async (params: any = {}) => {
    try {
      const response = await get('/api/test/resultList', {
        page: initPagination.page,
        pageSize: pagination.pageSize,
        ...params,
        isCompleted: params?.status == 2 ? 'false' : undefined,
        status: params?.status !== 2 ? params.status : undefined,
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
      title: 'テスト結果',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: { options: resultOption },
      render: (_, record) => {
        return record.isCompleted ? <TestResult point={record?.quizResult?.[0]?.score}/> : <TestResult status='default'/>
      }
    },
    {
      title: '受験者',
      dataIndex: 'user',
      render: (_, r) => [r?.lastName, r?.firstName].join(' ').trim() || '-'
    },
    {
      title: '最終更新日時',
      dataIndex: 'lastModifiedDate	',
      valueType: 'dateRange',
      search: {
        transform: (dates) => ({startDate: dates[0], endDate: dates[1] })
      },
      width: 150,
      render: (_, record) => dayjs(record?.lastModifiedDate).format('YYYY-MM-DD HH:mm:ss')
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
            {r?.document?.isPublic && r.isCompleted && <Button {...operateBtnProperty} style={{marginRight: 6 }} size='small'>再テスト</Button>}
          </Popconfirm>
        </div>
      )
    },
  ];

  const handleExportCsv = async () => {
    try {
      setExportLoading(true)

      const reqParams = {
        ...params,
        isCompleted: params?.status == 2 ? 'false' : undefined,
        status: params?.status !== 2 ? params.status : undefined,
      }

      const response = await get('/api/test/export', reqParams, { _customResponse: true } );
      console.log(response, 'export')
      if (response.status === HttpStatusCode.Ok) {
        console.log(response, 'handleExportCsv')
        const blob = new Blob([response.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `テスト結果_${new Date().toLocaleString()}.csv`;
        link.click();
      }
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    setExportLoading(false)
  }

  const expandedRowRender = (record: any) => {
    const data = record?.quizResult || [];

    return (
      <ProTable
        rowKey={Math.random().toString(16)}
        columns={[
          {
            title: '正解/総計',
            dataIndex: 'correctAnswers',
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
            title: '実施日時',
            dataIndex: 'completedAt',
            valueType: 'dateRange',
            search: {
              transform: (dates) => ({startDate: dates[0], endDate: dates[1] })
            },
            width: 150,
            render: (_, record) => dayjs(record.completedAt).format('YYYY-MM-DD HH:mm:ss')
          },
        ]}
        headerTitle={false}
        search={false}
        options={false}
        dataSource={data}
        pagination={false}
      />
    );
  };

  return (
    <div className="container">
      <ProTable
        rowKey="id" 
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
          setParams(params)
          return ({
            data: data || [],
            success: true,
            total: resPagination?.total || 0
          });
        }}
        columns={columns}
        expandable={{ expandedRowRender }}
        search={{
          labelWidth: 95,
          span: 8,
        }}
        toolbar={{
          actions: ([
            <Button loading={exportLoading} key='export' type="primary" onClick={handleExportCsv} icon={<ExportOutlined />}>
              エクスポート
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