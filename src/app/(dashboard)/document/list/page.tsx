"use client"
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Badge, Button, DatePicker, Input, Modal, Popconfirm, Typography } from 'antd';
import { TPagination } from '@/constants/type'
import { operateBtnProperty, publicEnum } from '@/constants';
import UploadModal from '@/components/UploadModal';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';

import './style.css';
import { UploadOutlined } from '@ant-design/icons';
import SpecifyModal from './SpecifyModal';

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
  const [isEdit, setEdit] = useState(false);
  const [isSpecify, setSpecify] = useState(false);
  const [current, setCurrent] = useState<any>();
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
      title: '順番',
      dataIndex: 'index',
      width: 40,
      hideInSearch: true,
      render: (_:any, __:any, index: number) => (pagination.page - 1) * pagination.pageSize + index + 1
    },
    {
      title: 'ドキュメントID',
      dataIndex: 'id',
      width: 150,
      ellipsis: true,
      copyable: true,
      hideInSearch: true,
    },
    {
      title: 'テーマ',
      dataIndex: 'theme',
      key: 'theme',
      ellipsis: true,
    },
    {
      title: 'ファイル名',
      dataIndex: 'fileName',
      className: 'fileName-cell',
      ellipsis: true,
      render: (name, record: any) => name
    },
    {
      title: 'コメント',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '公開状態',
      dataIndex: 'isPublic',
      // hideInSearch: true,
      width: 95,
      valueEnum: publicEnum,
      render: (_, record: any ) => <Badge status={record.isPublic ? 'success' : 'default'} text={record.isPublic ? '公開中' : '未公開'}/>
    },
    {
      title: '有効期限',
      dataIndex: 'deadline	',
      valueType: 'dateTime',
      width:150,
      hideInSearch: true,
      render: (_, record) =>  record.deadline ? dayjs(record.deadline).format('YYYY-MM-DD HH:mm:ss') : '期限無し'
    },
    // {
    //   title: '書類タイプ',
    //   width: '12%',
    //   dataIndex: 'fileType',
    //   hideInSearch: true,
    //   valueEnum: {
    //     [FILE_TYPE_TEXT[FILE_TYPE.PDF]]: { text: 'PDF' }
    //   },
    //   render: (_: any, { fileType }: any) => FILE_TYPE_TEXT[fileType as FILE_TYPE]
    // },
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
      dataIndex: 'username',
      hideInSearch: true,
      render: (_, r: any) => [r?.firstName, r?.lastName].join(' ').trim() || '-'
    },
    {
      title: 'サイズ',
      dataIndex: 'filesize',
      hideInSearch: true,
      width: 80,
      render: (v: any) => v ? Math.ceil(v / 1024) + 'KB' : '-'
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      valueType: 'option',
      hideInSearch: true,
      width: 160,
      render: (_, r: any) => (
        <div>
          {!r.isPublic && <Button
            {...operateBtnProperty} 
            style={{marginRight: 6 }} 
            onClick={() => {
              setSpecify(true);
              setCurrent(r);
            }}
            size='small'
          >公開</Button>}
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
          <Button onClick={() => {
            setEdit(true)
            setCurrent(r);
            }} {...operateBtnProperty} style={{marginLeft: 6 }}size='small'>編集</Button>
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
        search={{ span: 8, collapseRender: (collapsed) => collapsed ? '詳細検索' : '折り畳み' }}
        bordered
        scroll={{ x: 1300 }}
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
      <EditModal 
        open={isEdit} 
        handleCancel={() => {
          setEdit(false)
          setCurrent(undefined)
        }}
        record={current}
        actionRef={actionRef}
      />
      <SpecifyModal 
        open={isSpecify}
        handleCancel={() => {
          setSpecify(false)
          setCurrent(undefined)
        }}
        actionRef={actionRef}
        record={current}
      />
    </div>
  );
};

const EditModal = (props: any) => {
  const { open, handleCancel, record, actionRef } = props
  const [loading, setLoading] = useState(false);
  const [deadline, setDeadline] = useState<any>();
  const [comment, setComment] = useState<string>();
  const { message } = App.useApp();

  const onCancel = () => {
    setDeadline(undefined);
    setComment(undefined);
    setLoading(false)
    handleCancel?.();
  }

  useEffect(() => {
    if (!record) return;
    setDeadline(record?.deadline ? dayjs(record?.deadline) : undefined)
    setComment(record?.description)
  }, [record])

  const handleEditSubmit = async () => {
    setLoading(true);
    try {
      const { success, message: msg} = await postJson('/api/document/update', {
        id: record.id,
        deadline,
        comment
      })
      
      console.log(success, msg, 'handleEditSubmit')

      onCancel();
      if (success) {
        actionRef?.current?.reload()
        setLoading(false);
        return message.success(msg)
      }
      message.warning(msg)
    } catch (e: any) {
      message.error(e?.message)
    }
    setLoading(false);
  }

  return (
    <Modal
			title="編集" 
			cancelText="キャンセル" 
			open={open} 
			onCancel={onCancel} 
      onOk={handleEditSubmit}
      confirmLoading={loading}
			destroyOnClose
			okText="確認"
		>
			<div style={{ marginTop: 12 }}>
				<Typography.Text>有効期限：</Typography.Text>
				<DatePicker
					format="YYYY-MM-DD HH:mm:ss"
					showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
					value={deadline} onChange={(v) => setDeadline(v)}
					placeholder='有効期限を選択ください'
				/>
			</div>
			<div style={{ marginTop: 12 }}>
				<Typography.Text>コメント：</Typography.Text>
				<Input.TextArea style={{ marginTop: 6 }} value={comment} onChange={e => setComment(e.target.value)} placeholder='コメントを入力ください'/>
			</div>
		</Modal>
  )
}

export default FileUploadPage;