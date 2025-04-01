"use client"
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Badge, Button, Popconfirm, Table } from 'antd';
import { TPagination } from '@/constants/type'
import { FILE_TYPE_TEXT, FILE_TYPE, operateBtnProperty } from '@/constants';
import UploadModal from '@/components/UploadModal';

import './style.css';

const initPagination: TPagination  = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  showSizeChanger: true,
}

const FileUploadPage = () => {
  const [tableLoading, seTableLoading] = useState(false);
  const [documentList, setDocumentList] = useState([]);
  const [pagination, setPagination] = useState<TPagination>(initPagination);
  const [isOpen, setOpen] = useState(false);
  const { message } = App.useApp();
  
  const getFileInfoList = async (page: number = 1, pageSize: number = pagination.pageSize) => {
    try {
      seTableLoading(true);
      const response = await get('/api/document/list', { page, pageSize });
      console.log(response, 'getFileInfoList')
      setDocumentList(response?.data || []);
      setPagination({...pagination, ...(response?.pagination || {})});
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    seTableLoading(false)
  }

  useEffect(() => {
    getFileInfoList();
  }, [])
  
  const handleOperation = async (record: any, status: boolean) => {
    try {
      const { success, message: msg} = await postJson('/api/document/statusUpdate', {
        id: record.id,
        isPublic: status
      })
      
      console.log(success, msg, 'handleOperation')

      if (success) {
        getFileInfoList();
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
        getFileInfoList(initPagination.page, pagination.pageSize);
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
      title: 'ファイル名',
      dataIndex: 'fileName',
      key: 'fileName',
      className: 'fileName-cell',
      ellipsis: true,
      render: (name: string, record: any) => <a href={record.pathName} target='_blank'>{name}</a>
    },
    {
      title: 'ファイルId',
      dataIndex: 'id',
      key: 'fileId',
      ellipsis: true,
    },
    {
      title: '書類タイプ',
      width: '12%',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (v: FILE_TYPE) => FILE_TYPE_TEXT[v]
    },
    {
      title: 'サイズ',
      dataIndex: 'filesize',
      key: 'filesize',
      width: 80,
      render: (v: number) => v ? Math.ceil(v / 1024) + 'KB' : '-'
    },
    {
      title: '作成日時',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width:150,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '作成者',
      dataIndex: 'userName',
      key: 'userName',
      render: (_: string, r: any) => `${r.user.firstName} ${r.user.lastName}`
    },
    {
      title: '公開状態',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (v: boolean) => <Badge status={v ? 'success' : 'default'} text={v ? '公開中' : '未公開'}/>
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
    if (isUploaded) getFileInfoList();
    setOpen(false);
  }

  return (
    <div className="container">
      <UploadModal onCancel={handleModalCancel} isOpen={isOpen}/>
      <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>アップロード</Button>
      <Table 
        rowKey="id" 
        dataSource={documentList} 
        columns={columns}
        pagination={{ ...pagination, onChange: (page, pageSize) => getFileInfoList(page, pageSize)}}
        loading={tableLoading}
        bordered
        size='small'
      />
    </div>
  );
};

export default FileUploadPage;