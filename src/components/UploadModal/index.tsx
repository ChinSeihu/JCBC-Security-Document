import { useEffect, useState } from 'react';
import { post } from '@/lib';
import { Upload,Button,DatePicker, UploadProps, Input ,UploadFile, GetProp, Modal, App, Typography, Form } from 'antd';
import { InboxOutlined } from '@ant-design/icons'
import dayjs from 'dayjs';
const { Dragger } = Upload;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const layout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 20 },
  };
const UploadModal = (props: any) => {
	const [file, setFile] = useState<UploadFile | File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [isOpen, setOpen] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);
	const { message } = App.useApp();
	const [form] = Form.useForm();

	useEffect(() => {
		setOpen(props.isOpen);
	}, [props.isOpen])

	// アップロード
	const handleUpload = async () => {
		try {
			if (!file) return;
			setUploading(true);
			await form.validateFields();
			console.log(form.getFieldsValue())
			const { deadline, theme, description } = form.getFieldsValue();
			const formData = new FormData();
			formData.append('file', file as FileType);
			formData.append('description', description || '');
			!!deadline ? formData.append('deadline', deadline) : null;
			formData.append('theme', theme);

			const response = await post('/api/document/upload', formData);
			if (response?.success) {
				message.success('ファイルのアップロードに成功しました！');
				setIsUploaded(true);
				handleReset();
			} else {
				message.error('ファイルのアップロードに失敗しました！');
			}
		} catch (error: any) {
			const errorMsg = error.message || error?.errorFields?.[0]?.errors?.[0] || 'エラーが発生しました'
			console.log(error, "error>>>>")
			message.error(errorMsg);
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

	const handleReset = () => {
		setFile(null);
		form.resetFields();
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
			title="アップロード" 
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
				<p className="ant-upload-drag-icon">
					<InboxOutlined />
				</p>
				<p className="ant-upload-text">アップロードするには、ファイルをクリックまたはこの領域にドラッグします</p>
				<p className="ant-upload-hint">
				単一だけアップロードをサポートします。会社のデータやその他の禁止ファイルのアップロードはご遠慮ください。
				</p>
			</Dragger>
			<Form
				{...layout}
				form={form}
				style={{ marginTop: 20 }}
				labelAlign="left"
			>
				<Form.Item
					label="テーマ"
					name="theme"
					rules={[
						{
							required: true,
							message: 'テーマを入力ください'
						}
					]}
				>
					<Input maxLength={255} placeholder='テーマを入力ください'/>
				</Form.Item>
				<Form.Item
					label="有効期限"
					name="deadline"
					initialValue={undefined}
				>
					<DatePicker
						format="YYYY-MM-DD HH:mm:ss"
						showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
						placeholder='有効期限を選択ください'
					/>
				</Form.Item>
				<Form.Item
					label="コメント"
					name="description"
				>
					<Input.TextArea placeholder='コメントを入力ください'/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default UploadModal;