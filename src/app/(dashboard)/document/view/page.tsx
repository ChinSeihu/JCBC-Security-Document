"use client"
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Style from './style.module.css'
import { App, Button, Empty, FloatButton, Pagination, Spin } from 'antd';
import QuestionDrawer from '@/components/QuestionDrawer';
import { get } from '@/lib';

// 配置 PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const PDFViewer = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fileInfo, setFileInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [fileurl, setFileurl] = useState<any>();

  const [isTesting, setIsTesting] = useState(false);
  const { message } = App.useApp();

  // PDF 加载成功回调
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const getFileStream = async () => {
    try {
      setLoading(true)
      const fileResponse = await fetch('/api/document/fileStream')
      if (fileResponse.ok) {
        const blob = await fileResponse.blob();
        setFileurl(URL.createObjectURL(blob))
      }
    }catch (e: any) {
      message.error(e?.message)
    }
    setLoading(false)
  }
  const getFileInfo = async () => {
    try {
      setLoading(true)
      const fileResponse = await get('/api/document/fileInfo')
      setFileInfo(fileResponse)
      return fileResponse || {}
    } catch (e: any) {
      message.error(e?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getFileInfo().then((res) => {
      if (res.success) getFileStream()
    })
  }, [])

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  }

  const handleModalCancel = () => {
    setOpen(false);
  }

  const handleToTest = () => {
    setOpen(true);
    setIsTesting(true);
  }

  return (
    <div className={Style["container"]}>
      <div className={Style["pdf-container"]}>
        <Spin spinning={loading}>
          {isTesting && <FloatButton type="primary" onClick={() => setOpen(true)}/>}
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
      <QuestionDrawer 
        onCancel={handleModalCancel} 
        isOpen={isOpen} 
        documentId={fileInfo.id} 
        testStatus={fileInfo?.testStatus || {}}
        setOpen={setOpen}
      />
      <div className="document-view-draw-container"/>
      {numPages && (
        <div className={Style["pagination"]}>
          <Pagination onChange={handlePageChange} total={numPages} showSizeChanger={false} pageSize={1}/>
          <Button onClick={handleToTest} type="primary" size="small" className="ml-4px mr-4px text-xs">試験</Button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;