"use client"
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Badge, Button, Popconfirm, Typography } from 'antd';
import { TPagination } from '@/constants/type'
import { FILE_TYPE_TEXT, FILE_TYPE, operateBtnProperty, publicEnum } from '@/constants';
import UploadModal from '@/components/UploadModal';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { LightFilter, ProFormSelect, ProTable } from '@ant-design/pro-components';

import './style.css';
import { UploadOutlined } from '@ant-design/icons';

const initPagination: TPagination  = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  showSizeChanger: true,
}

const FileUploadPage = () => {
  const [pagination, setPagination] = useState<TPagination>(initPagination);
  const [isOpen, setOpen] = useState(false);
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  
  const getFileInfoList = async (params = {}) => {
    try {
      const response = await get('/api/document/list', {
        page: initPagination.page,
        pageSize: pagination.pageSize,
        ...params,
      });
      return response;
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
  }
  
  const handleOperation = async (record: any, status: boolean) => {
    try {
      const { success, message: msg} = await postJson('/api/document/statusUpdate', {
        id: record.id,
        isPublic: status
      })
      
      console.log(success, msg, 'handleOperation')

      if (success) {
        actionRef.current?.reload()
        return message.success(msg)
      }
      message.warning(msg)
    } catch (e: any) {
      message.error(e?.message)
    }
  }

  const handleFileDelete = async (record: any) => {
    try {
      const { success, message: msg} = await postJson('/api/document/delete', {
        id: record.id,
        isPublic: record.isPublic
      })
      
      console.log(success, msg, 'handleFileDelete')

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
      dataIndex: 'index',
      width: 40,
      hideInSearch: true,
      render: (_:any, __:any, index: number) => (pagination.page - 1) * pagination.pageSize + index + 1
    },
    {
      title: 'ファイル名',
      dataIndex: 'fileName',
      className: 'fileName-cell',
      ellipsis: true,
      render: (name, record: any) => <a href={record.pathName} target='_blank'>{name}</a>
    },
    {
      title: 'ファイルId',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '公開状態',
      dataIndex: 'isPublic',
      // hideInSearch: true,
      valueEnum: publicEnum,
      render: (_, record: any ) => <Badge status={record.isPublic ? 'success' : 'default'} text={record.isPublic ? '公開中' : '未公開'}/>
    },
    {
      title: '書類タイプ',
      width: '12%',
      dataIndex: 'fileType',
      hideInSearch: true,
      valueEnum: {
        [FILE_TYPE_TEXT[FILE_TYPE.PDF]]: { text: 'PDF' }
      },
      render: (_: any, { fileType }: any) => FILE_TYPE_TEXT[fileType as FILE_TYPE]
    },
    {
      title: 'サイズ',
      dataIndex: 'filesize',
      hideInSearch: true,
      width: 80,
      render: (v: any) => v ? Math.ceil(v / 1024) + 'KB' : '-'
    },
    {
      title: '作成日時',
      dataIndex: 'createdDate',
      valueType: 'dateRange',
      width:150,
      search: {
        transform: (dates) => ({startDate: dates[0], endDate: dates[1] })
      },
      render: (_, record) =>  dayjs(record.createdDate).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '作成者',
      dataIndex: 'userName',
      hideInSearch: true,
      render: (_, r: any) => `${r.user.firstName} ${r.user.lastName}`
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      valueType: 'option',
      hideInSearch: true,
      width: 140,
      render: (_, r: any) => (
        <div>
          <Popconfirm
            title="ファイル公開"
            description="当該のファイルを公開しますか?"
            onConfirm={() => {handleOperation(r, true)}}
            onCancel={() => {}}
            okText="はい"
            cancelText="キャンセル"
          >
            {!r.isPublic && <Button {...operateBtnProperty} style={{marginRight: 6 }} size='small'>公開</Button>}
          </Popconfirm>
          <Popconfirm
            title="ファイルの公開を取り下げ"
            description="公開中のファイルを取り下げますか?"
            onConfirm={() => {handleOperation(r, false)}}
            onCancel={() => {}}
            okText="はい"
            cancelText="キャンセル"
          >
            {r.isPublic && <Button {...operateBtnProperty} size='small'>取り下げ</Button>}
          </Popconfirm>
          <Popconfirm
            title="ファイルの削除"
            description="このファイルを削除しますか?"
            onConfirm={() => {handleFileDelete(r)}}
            onCancel={() => {}}
            okText="はい"
            cancelText="キャンセル"
          >
            {!r.isPublic && <Button {...operateBtnProperty} size='small'>削除</Button>}
          </Popconfirm>
        </div>
      )
    },
  ];

  const handleModalCancel = (isUploaded: boolean) => {
    if (isUploaded) actionRef.current?.reload();
    setOpen(false);
  }

  return (
    <div className="container">
      <UploadModal onCancel={handleModalCancel} isOpen={isOpen}/>
      <ProTable
        rowKey="id" 
        actionRef={actionRef}
        cardBordered
        request={async (params, sorter, filter) => {
          console.log(params, sorter, filter);
          const { pagination: resPagination, data } = await getFileInfoList({
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
        pagination={{ ...pagination }}
        search={{ span: 8 }}
        bordered
        defaultSize='small'
        toolbar={{
          actions: ([
            <Button key='upload' type="primary" onClick={() => setOpen(true)} icon={<UploadOutlined />}>
              アップロード
            </Button>,
          ]),
        }}
        headerTitle={<Typography.Title level={5}>ドキュメント一覧</Typography.Title>}
      />
    </div>
  );
};

export default FileUploadPage;