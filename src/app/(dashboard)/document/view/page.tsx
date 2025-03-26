"use client"
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Style from './style.module.css'
import { get } from '@/lib';
import { Button, message, Pagination, Spin } from 'antd';

// 配置 PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const PDFViewer = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [filePath, setFilePath] = useState<string | File | null>(null);
  const [loading, setLoading] = useState(false);

  // PDF 加载成功回调
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const getFileStream = async () => {
    try {

      setLoading(true)
      const fileResponse = await get('/api/document/getFilePath')
      setFilePath(fileResponse.pathName);
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

  return (
    <div className={Style["container"]}>
      <div className={Style["pdf-container"]}>
        <Spin spinning={loading}>
          <Document
            file={filePath}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div>Loading PDF...</div>}
            error={<div>Failed to load PDF!</div>}
            >
            <Page
              className={Style["pdf-page-content"]}
              pageNumber={pageNumber} 
              width={800}
              loading={<div>Loading page...</div>}
            />
          </Document>
        </Spin>
      </div>

      {numPages && (
        <div className={Style["pagination"]}>
          <Pagination onChange={handlePageChange} total={numPages} pageSize={1}/>
          <Button type="primary" size="small" className="ml-4px mr-4px rounded-xl">既読にする</Button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;