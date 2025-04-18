import { useEffect, useState } from 'react';
import { post } from '@/lib';
import { Upload,Button, UploadProps, Input ,UploadFile, GetProp, Modal, App, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons'
const { Dragger } = Upload;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const UploadModal = (props: any) => {
	const [file, setFile] = useState<UploadFile | File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);
	const [comment, setComment] = useState<string>()
	const { message } = App.useApp();

	useEffect(() => {
		setOpen(props.isOpen);
	}, [props.isOpen])

	// アップロード
	const handleUpload = async () => {
		if (!file) return;
		setUploading(true);

		const formData = new FormData();
		formData.append('file', file as FileType);
		formData.append('description', comment as string);

		try {
			const response = await post('/api/document/upload', formData);
			if (response?.success) {
				message.success('ファイルのアップロードに成功しました！');
				setIsUploaded(true);
				setFile(null);
				setComment('')
			} else {
				message.error('ファイルのアップロードに失敗しました！');
			}
		} catch (error: any) {
			console.log(error, "error>>>>")
			message.error(error.message);
		}
		setUploading(false);
	};

	const uploadProps: UploadProps = {
		accept: '.pdf',
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

	const handleCancel = () => {
		if (uploading) {
			return Modal.confirm({
				title: 'キャンセル確認',
				content: 'アップロード中のですが、キャンセルしますか？',
				onCancel: () => {},
				onOk: () => {
					setOpen(false);
					props?.onCancel?.(isUploaded);
				}
			})}
		setOpen(false);
		props?.onCancel?.(isUploaded);
	}

	return (
		<Modal
			title="アップロード" 
			cancelText="キャンセル" 
			open={isOpen} 
			onCancel={handleCancel} 
			destroyOnClose
			okButtonProps={{ hidden: true }}
		>
			<Dragger  
				{...uploadProps}
			>
				<p className="ant-upload-drag-icon">
					<InboxOutlined />
				</p>
				<p className="ant-upload-text">アップロードするには、ファイルをクリックまたはこの領域にドラッグします</p>
				<p className="ant-upload-hint">
				単一だけアップロードをサポートします。会社のデータやその他の禁止ファイルのアップロードはご遠慮ください。
				</p>
			</Dragger>
			<div style={{ marginTop: 12 }}>
				<Typography.Text>コメント：</Typography.Text>
				<Input.TextArea value={comment} onChange={e => setComment(e.target.value)} placeholder='コメントを入力ください'/>
			</div>
			<Button
				type="primary"
				onClick={handleUpload}
				disabled={!file}
				loading={uploading}
				style={{ marginTop: 16 }}
			>
				アップロード
			</Button>
		</Modal>
	);
};

export default UploadModal;