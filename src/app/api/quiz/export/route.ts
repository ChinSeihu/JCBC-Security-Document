import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { exportList } from './server';
import { getSearchParams } from '@/lib/actions';
import { parse } from 'json2csv'
import dayjs from 'dayjs';

const EXPORT_HEADER = {
  id: '問題ID',
  content: '問題内容',
  documentId: 'ドキュメントID',
  questionType: '問題種類',
  optionId: '選択肢ID',
  optionContent: '選択肢内容',
  optionOrder: '選択肢順番',
  optionCorrect: '正解',
  createdDate: '作成日時',
  createAt: '作成者',
  modifiedAt: '最後更新者',
  lastModifiedDate: '更新日時'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = getSearchParams(searchParams);
    
    const result = await exportList(params)

    const dataFormat = result.map((item: any, idx: number) => {
      const csvRow: Record<string, string> = {};

      Object.keys(EXPORT_HEADER).forEach(key => {
        switch (key) {
          case 'createdDate':
            csvRow[key] = item.createdDate ? dayjs(item.createdDate).format('YYYY-MM-DD HH:mm:ss') : '-'
            break;
          case 'lastModifiedDate':
            csvRow[key] = item.lastModifiedDate ? dayjs(item.lastModifiedDate).format('YYYY-MM-DD HH:mm:ss') : '-'
            break;
          case 'createAt':
            csvRow[key] = item.lastName + item.firstName
            break;
          default :
            csvRow[key] = item[key]
        }
      })

      return csvRow;
    })
    console.log(dataFormat, 'dataFormat')
    const csv = parse(dataFormat)
    const filename = encodeURIComponent(`問題集_${new Date().toLocaleString()}.csv`);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": 'text/csv',
        "Content-Disposition": `attachment; filename="${filename}"`,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: HttpStatusCode.InternalServerError }
    );
  }
}