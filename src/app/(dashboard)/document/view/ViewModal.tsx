"use client"
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Style from './style.module.css'
import { App, Empty, FloatButton, Modal, Pagination, Spin } from 'antd';

// 配置 PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const ViewModal = (props: any) => {
  const { documentId } = props;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [fileurl, setFileurl] = useState<any>();

  const { message } = App.useApp();

  useEffect(() => {
    setOpen(props.isOpen);
  }, [props])

  // PDF 加载成功回调
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const getFileStream = async () => {
    try {
      setLoading(true)
      const fileResponse = await fetch(`/api/document/fileStream?documentId=${documentId}`)
      if (fileResponse.ok) {
        const blob = await fileResponse.blob();
        setFileurl(URL.createObjectURL(blob))
      }
    }catch (e: any) {
      message.error(e?.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    isOpen && getFileStream()
  }, [isOpen])


  const handlePageChange = (page: number) => {
    setPageNumber(page);
  }

  const handleModalCancel = () => {
    setOpen(false);
    props?.onCancel?.()
  }

  return (
    <Modal okButtonProps={{ hidden: true }} open={isOpen} width={'70%'} onCancel={handleModalCancel}>
        <div className={Style["container"]}>
        <div className={Style["pdf-container"]}>
            <Spin spinning={loading}>
            {fileurl ? 
                <Document
                file={fileurl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div>Loading PDF...</div>}
                error={<div>Failed to load PDF!</div>}
                >
                <Page
                    className={Style["pdf-page-content"]}
                    pageNumber={pageNumber} 
                    width={795}
                    loading={<div>Loading page...</div>}
                />
                </Document>
                : <Empty style={{ marginTop: '20%' }}/>}
            </Spin>
        </div>
        <div className="document-view-draw-container"/>
        {numPages && (
            <div className={Style["pagination"]}>
            <Pagination onChange={handlePageChange} total={numPages} showSizeChanger={false} pageSize={1}/>
            {/* <Button onClick={handleToTest} type="primary" size="small" className="ml-4px mr-4px text-xs">試験</Button> */}
            </div>
        )}
        </div>
    </Modal>
  );
};

export default ViewModal;