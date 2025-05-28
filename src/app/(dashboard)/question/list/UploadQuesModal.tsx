import { useEffect, useState } from 'react';
import { post } from '@/lib';
import { Upload, UploadProps ,UploadFile, GetProp, Modal, App, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const { Dragger } = Upload;

const UploadQuesModal = (props: any) => {
	const [file, setFile] = useState<UploadFile | File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		setOpen(props.isOpen);
	}, [props.isOpen])

	// アップロード
	const handleUpload = async () => {
		try {
			if (!file) return;
			setUploading(true);
			const formData = new FormData();
			formData.append('file', file as FileType);

			const response = await post('/api/quiz/upload', formData);
			if (response?.success) {
				message.success('更新に成功しました！');
				setIsUploaded(true);
				handleCancel();
			} else {
				message.error('更新に失敗しました！');
			}
		} catch (error: any) {
			const errorMsg = error.message || error?.errorFields?.[0]?.errors?.[0] || 'エラーが発生しました'
			console.log(error, "error>>>>")
			message.error(errorMsg);
		}
		setUploading(false);
	};

	const uploadProps: UploadProps = {
		accept: '.csv',
		fileList: file ? [file as UploadFile] : [],
		beforeUpload: (file) => {
			setFile(file);
			return false;
		},
		onRemove: () =>  setFile(null),
		onDrop: (e) => {
			console.log('Dropped files', e.dataTransfer.files);
			setFile(e.dataTransfer.files[0]);
		},
	};

	const handleReset = () => {
		setFile(null);
		props?.onCancel?.(isUploaded);
	}

	const handleCancel = () => {
		if (uploading) {
			return Modal.confirm({
				title: 'キャンセル確認',
				content: 'アップロード中のですが、キャンセルしますか？',
				onCancel: () => {},
				onOk: () => {
					setOpen(false);
					props?.onCancel?.(isUploaded);
					handleReset()
				}
			})}
		setOpen(false);
		props?.onCancel?.(isUploaded);
		handleReset()
	}

	return (
		<Modal
			title="問題集アップロード" 
			cancelText="キャンセル" 
			open={isOpen} 
			onCancel={handleCancel} 
			destroyOnClose
			okButtonProps={{ disabled: !file }}
			okText="アップロード"
			confirmLoading={uploading}
			onOk={handleUpload}
		>
			<Dragger  
				{...uploadProps}
			>
				<span style={{ color: 'gray'}}>ファイルをここにクリックまたはドラッグしてください</span>
			</Dragger>
			<p style={{ marginTop: 12 }}>問題編集csvテンプレート資料は <a style={{color: '#1677ff'}} type='download' href='/questionTemplate.csv'>こちら</a></p>
		</Modal>
	);
};

export default UploadQuesModal;