"use client"
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { get, postJson } from '@/lib';
import { App, Button, Popconfirm, Table, Tooltip } from 'antd';
import { TPagination } from '@/constants/type'
import {  operateBtnProperty, QUESTION_TYPE } from '@/constants';
import QuesFormModal from '@/components/QuesFormModal';

import Style from './style.module.css';

const initPagination: TPagination  = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  showSizeChanger: true,
}

const QuestionList = () => {
  const [tableLoading, seTableLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [pagination, setPagination] = useState<TPagination>(initPagination);
  const [isOpen, setOpen] = useState(false);
	const { message } = App.useApp();

  const getQuestionList = async (page: number = 1, pageSize: number = pagination.pageSize) => {
    try {
      seTableLoading(true);
      const response = await get('/api/quiz/list', { page, pageSize });
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

  const handleQuizDelete = async (record: any) => {
    try {
      const { success, message: msg} = await postJson('/api/quiz/delete', {
        id: record.id
      })
      
      console.log(success, msg, 'handleQuizDelete')

      if (success) {
        getQuestionList(initPagination.page, pagination.pageSize);
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
      width: 150,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '作成者',
      dataIndex: 'userName',
      key: 'userName',
      render: (_: string, r: any) => `${r.user.firstName} ${r.user.lastName}`
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
            title="問題の削除"
            description="この問題を削除しますか?"
            onConfirm={() => {handleQuizDelete(r)}}
            onCancel={() => {}}
            okText="はい"
            cancelText="キャンセル"
          >
            {!r.isPublic && <Button {...operateBtnProperty} size='small' style={{ marginRight: 6 }}>削除</Button>}
          </Popconfirm>
          <Tooltip title='実装中...'>
            <Button {...operateBtnProperty} size='small'>編集</Button>
          </Tooltip>
        </div>
      )
    },
  ];

  const handleModalCancel = (msg?: string) => {
    if (msg?.length) message.success(msg)
    setOpen(false);
  }

  return (
    <div className="container">
      <QuesFormModal onCancel={handleModalCancel} isOpen={isOpen} onSuccess={getQuestionList}/>
      <Button type='primary' onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>新規追加</Button>
      <Table 
        rowKey="id" 
        dataSource={questionList} 
        columns={columns}
        pagination={{ ...pagination, onChange: (page, pageSize) => getQuestionList(page, pageSize)}}
        loading={tableLoading}
        bordered
        size='small'
      />
    </div>
  );
};

export default QuestionList;