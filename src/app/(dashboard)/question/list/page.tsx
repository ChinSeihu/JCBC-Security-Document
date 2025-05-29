"use client"
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Button, Popconfirm, Table, Tooltip, Typography } from 'antd';
import { TPagination } from '@/constants/type'
import {  operateBtnProperty, QUESTION_TYPE_EUNM } from '@/constants';
import QuesFormModal from '@/components/QuesFormModal';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';

import Style from './style.module.css';
import { ExportOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import UploadQuesModal from './UploadQuesModal';
import { HttpStatusCode } from 'axios';

const initPagination: TPagination  = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  showSizeChanger: true,
}

const QuestionList = () => {
  const [pagination, setPagination] = useState<TPagination>(initPagination);
  const [isOpen, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const actionRef = useRef<ActionType>();
	const { message } = App.useApp();
  const [isEdit, setEdit] = useState(false)
  const [record, setRecord] = useState<any>()
  const [exportLoading, setExportLoading] = useState(false)
  const [params, setParams] = useState<any>({})

  const getQuestionList = async (params = {}) => {
    try {
      const response = await get('/api/quiz/list', {
        page: initPagination.page,
        pageSize: pagination.pageSize,
        ...params,
      });
      console.log(response, 'getQuestionList')
      return response;
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
  }

  const handleQuizDelete = async (record: any) => {
    try {
      const { success, message: msg} = await postJson('/api/quiz/delete', {
        id: record.id
      })
      
      console.log(success, msg, 'handleQuizDelete')

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
      hideInSearch: true,
      width: 40,
      render: (_:any, __:any, index: number) => (pagination.page - 1) * pagination.pageSize + index + 1
    },
    {
      title: '関連ドキュメント',
      dataIndex: 'document',
      valueType: 'text',
      ellipsis: true,
      className: Style['fileName-cell'],
      formItemProps: {
        label: 'ドキュメント',
      },
      render: (_, record) => record.document.fileName   
    },
    {
      title: 'テーマ',
      dataIndex: 'theme',
      ellipsis: true,
      render: (_, record) => record.document.theme
    },
    {
      title: '問題タイプ',
      width: '10%',
      dataIndex: 'questionType',
      valueEnum: QUESTION_TYPE_EUNM,
    },
    {
      title: '問題内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '作成日時',
      dataIndex: 'createdDate',
      valueType: 'dateRange',
      search: {
        transform: (dates) => ({startDate: dates[0], endDate: dates[1] })
      },
      width: 150,
      render: (_, record) => dayjs(record?.createdDate).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '作成者',
      dataIndex: 'userName',
      render: (_, r: any) => [r?.firstName, r?.lastName].join(' ').trim() || '-'
    },
    {
      title: '最後更新日時',
      dataIndex: 'lastModifiedDate',
      valueType: 'dateTime',
      width: 150,
      hideInSearch: true,
      // render: (_, record) => dayjs(record?.createdDate).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '最後更新者',
      dataIndex: 'modifiedAt',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      valueType: 'option',
      width: 120,
      render: (_, r: any) => (
        <div>
          <Popconfirm
            title="問題の削除"
            description="この問題を削除しますか?"
            onConfirm={() => {handleQuizDelete(r)}}
            onCancel={() => {}}
            okText="はい"
            cancelText="キャンセル"
          >
            {!r.isPublic && <Button {...operateBtnProperty} size='small' style={{ marginRight: 6 }}>削除</Button>}
          </Popconfirm>
          <Button {...operateBtnProperty} size='small' onClick={() => handleModalOpen(true, r)}>編集</Button>
        </div>
      )
    },
  ];

  const handleModalCancel = (msg?: string) => {
    if (msg?.length) message.success(msg)
    setOpen(false);
    setEdit(false);
    setRecord(null)
  }

  const handleModalOpen = (isEdit: boolean, record?: any) => {
    setOpen(true);
    setEdit(isEdit);
    setRecord(record || {});
  }

  const handleExportCsv = async () => {
    try {
      if (!pagination.total) {
        return message.warning('データを見つけないので、ご確認ください。');
      }

      setExportLoading(true)

      const reqParams = {
        ...params,
        isCompleted: params?.status == 2 ? 'false' : undefined,
        status: params?.status !== 2 ? params.status : undefined,
      }

      const response = await get('/api/quiz/export', reqParams, { _customResponse: true } );
      console.log(response, 'export')
      if (response.status === HttpStatusCode.Ok) {
        console.log(response, 'handleExportCsv')
        const blob = new Blob([response.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `問題集_${new Date().toLocaleString()}.csv`;
        link.click();
      }
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    setExportLoading(false)
  }

  const handleUploadCancel = (isUploaded: boolean) => {
    if (isUploaded) actionRef.current?.reload();
    setUploadOpen(false);
  }

  return (
    <div className="container">
      <QuesFormModal 
        onCancel={handleModalCancel} 
        isOpen={isOpen} 
        onSuccess={() => actionRef.current?.reload()}
        isEdit={isEdit}
        questionId={record?.id}
      />
      <UploadQuesModal onCancel={handleUploadCancel} isOpen={uploadOpen}/>
      <ProTable
        rowKey="idx" 
        actionRef={actionRef}
        cardBordered
        request={async (params, sorter, filter) => {
          console.log(params, sorter, filter);
          const { pagination: resPagination, data } = await getQuestionList({
            ...params,
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
        scroll={{ x: 1300 }}
        search={{
          labelWidth: 95,
          span: 8,
          collapseRender: (collapsed: boolean) => collapsed ? '詳細検索' : '折り畳み'
        }}
        toolbar={{
          actions: ([
            <Button key='add' type="primary" onClick={() => handleModalOpen(false)} icon={<PlusOutlined />}>
              新規追加
            </Button>,
            <Button key='upload' type="primary" onClick={() => setUploadOpen(true)} icon={<UploadOutlined />}>
              アップロード
            </Button>,
            [
            <Button loading={exportLoading} key='export' type="primary" onClick={handleExportCsv} icon={<ExportOutlined />}>
              エクスポート
            </Button>
          ]
          ]),
        }}
        pagination={{ ...pagination }}
        bordered
        defaultSize='small'
        headerTitle={<Typography.Title level={5}>問題一覧</Typography.Title>}
      />
    </div>
  );
};

export default QuestionList;