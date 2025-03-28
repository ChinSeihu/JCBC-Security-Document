"use client"
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Button, Table } from 'antd';
import { IPagination } from '@/constants/type'
import {  QUESTION_TYPE } from '@/constants';
import QuesFormModal from '@/components/QuesFormModal';

import Style from './style.module.css';

const initPagination: IPagination  = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
}

const FileUploadPage = () => {
  const [tableLoading, seTableLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [pagination, setPagination] = useState<IPagination>(initPagination);
  const [isOpen, setOpen] = useState(false);
	const { message } = App.useApp();

  const getQuestionList = async () => {
    try {
      seTableLoading(true);
      const response = await get('/api/quiz/list');
      console.log(response, 'getQuestionList')
      setQuestionList(response?.data || []);
      setPagination({...pagination, ...(response?.pagination || {})});
    } catch (error: any) {
      console.log(error, "error>>>>")
      message.error(error.message);
    }
    seTableLoading(false)
  }

  useEffect(() => {
    getQuestionList();
  }, [])
  

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
      ellipsis: true,
      render: (document: any, record: any) => document.fileName
    },
    {
      title: 'ドキュメントID',
      dataIndex: 'documentId',
      key: 'documentId',
      ellipsis: true
    },
    {
      title: '問題タイプ',
      width: '10%',
      dataIndex: 'questionType',
      key: 'questionType',
      render: (v: "SINGLE_CHOICE" | "MULTIPLE_CHOICE") => QUESTION_TYPE[v]
    },
    {
      title: '問題内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '作成日時',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '作成者',
      dataIndex: 'userName',
      key: 'userName',
      render: (_: string, r: any) => `${r.user.firstName} ${r.user.lastName}`
    }
  ];

  const handleModalCancel = (msg?: string) => {
    if (msg?.length) message.success(msg)
    setOpen(false);
  }

  return (
    <div className="container">
      <QuesFormModal onCancel={handleModalCancel} isOpen={isOpen} onSuccess={getQuestionList}/>
      <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>新規追加</Button>
      <Table 
        rowKey="id" 
        dataSource={questionList} 
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