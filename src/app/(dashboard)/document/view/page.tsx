"use client"
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Style from './style.module.css'
import { get } from '@/lib';
import { Affix, App, Button, FloatButton, Pagination, Spin } from 'antd';
import QuestionDrawer from '@/components/QuestionDrawer';

// 配置 PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const PDFViewer = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fileInfo, setFileInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { message } = App.useApp();
  
  // PDF 加载成功回调
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const getFileStream = async () => {
    try {
      setLoading(true)
      const fileResponse = await get('/api/document/getFileInfo')
      setFileInfo(fileResponse);
    }catch (e: any) {
      message.error(e?.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    getFileStream();
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
          <Document
            file={fileInfo?.pathName}
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
          <Pagination onChange={handlePageChange} total={numPages} pageSize={1}/>
          <Button onClick={handleToTest} type="primary" size="small" className="ml-4px mr-4px">試験</Button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;