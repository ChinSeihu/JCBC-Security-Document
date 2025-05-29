"use client"
import { get, getUserList, postJson } from '@/lib';
import { App, Input, Modal, Table, TableColumnsType, TableProps, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react'

interface DataType {
    key: React.Key;
    name: string;
    eamil: number;
  }

export default function SpecifyModal(props: any) {
    const { open, handleCancel, record, actionRef } = props
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [userList, setUserList] = useState<any[]>([]);
    const { message } = App.useApp();
  
    const onCancel = () => {
      setLoading(false)
      handleCancel?.();
      setSelectedRowKeys([])
    }
  
    useEffect(() => {
      if (!record) return;
      getAllUsers();
      getPublishedList();
    }, [record])
  
    const handleSpecifySubmit = async () => {
    if (!selectedRowKeys.length) return message.warning("公開対象ユーザーを選択してください");
    try {
        setLoading(true);
        const { success, message: msg} = await postJson('/api/document/statusUpdate', {
            id: record.id,
            isPublic: true,
            targetIds: selectedRowKeys
        })
        
        console.log(success, msg, 'handleSpecifySubmit')
  
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

    const getAllUsers = async () => {
      try {
        setLoading(true);
        const userList = await get('/api/auth/userList');
        setUserList(userList);
      } catch (e: any) {
        message.error(e?.message)
      }
      setLoading(false);
    }

    const getPublishedList = async () => {
      try {
        setLoading(true);
        const publicList = await get('/api/document/publicList', { documentId: record.id });
        setSelectedRowKeys(publicList?.data?.map?.((it: any) => it.userId) || []);
      } catch (e: any) {
        message.error(e?.message)
      }
      setLoading(false);
    }

    const columns: TableColumnsType<any> = [
        {
          title: '名前',
          dataIndex: 'name',
          render: (_, record) => <a>{record.lastName} {record.firstName}</a>,
        },
        {
          title: 'メール',
          dataIndex: 'email',
        }
      ];

    console.log(selectedRowKeys, '<<<<<<<<<<<<<<<<<selectedRowKeys')
    const dataSource = useMemo(() => userList?.map?.((item: any) => ({
        ...item,
        name: `${item.lastname} ${item.firstname}`,
    })), [userList])


    const rowSelection: TableProps<DataType>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            setSelectedRowKeys(selectedRowKeys);
        },
        selectedRowKeys
    };
  
    return (
        <Modal
            title="公開対象" 
            cancelText="キャンセル" 
            open={open}
            onCancel={onCancel} 
            onOk={handleSpecifySubmit}
            confirmLoading={loading}
            destroyOnClose
            okText="指定"
        >
            <Table<DataType>
                rowKey="id"
                bordered
                loading={loading}
                size="small"
                style={{
                    height: 390
                }}
                rowSelection={{ type: 'checkbox', ...rowSelection }}
                columns={columns}
                pagination={{
                    pageSize: 8
                }}
                dataSource={dataSource}
            />
          </Modal>
    )
  }
  