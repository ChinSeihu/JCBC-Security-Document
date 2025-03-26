"use client"
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { Badge, Button, message, Popconfirm, Space, Table } from 'antd';
import { IPagination } from '@/constants/type'
import { FILE_TYPE_TEXT, FILE_TYPE } from '@/constants';
import UploadModal from '@/components/UploadModal';

import Style from './style.module.css';

const initPagination: IPagination  = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
}

const FileUploadPage = () => {
  const [tableLoading, seTableLoading] = useState(false);
  const [documentList, setDocumentList] = useState([]);
  const [pagination, setPagination] = useState<IPagination>(initPagination);
  const [isOpen, setOpen] = useState(false);

  const getFileInfoList = async () => {
    try {
      seTableLoading(true);
      const response = await get('/api/document/list');
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
      title: '書類タイプ',
      width: '10%',
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
      dataIndex: 'createdAt',
      key: 'createdAt',
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
            onConfirm={() => handleOperation(r, true)}
            onCancel={() => {}}
            okText="公開"
            cancelText="キャンセル"
          >
            {!r.isPublic && <Button type='link' style={{marginRight: 6 }} size='small'>公開</Button>}
          </Popconfirm>
          <Popconfirm
            title="ファイルの公開を取り下げ"
            description="公開中のファイルを取り下げますか?"
            onConfirm={() => handleOperation(r, false)}
            onCancel={() => {}}
            okText="取り下げ"
            cancelText="キャンセル"
          >
            {r.isPublic && <Button type='link' size='small'>取り下げ</Button>}
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
      <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>新規追加</Button>
      <Table 
        rowKey="id" 
        dataSource={documentList} 
        columns={columns}
        pagination={pagination}
        loading={tableLoading}
        bordered
        size='small'
      />
    </div>
  );
};

export default FileUploadPage;