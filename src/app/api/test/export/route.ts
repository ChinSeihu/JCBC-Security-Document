import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { exportList } from './server';
import { getSearchParams } from '@/lib/actions';
import { parse } from 'json2csv'
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = getSearchParams(searchParams);
    
    const result = await exportList(params)

    const dataFormat = result.map((item: any, idx: number) => {
      return {
        '番号': idx + 1,
        '関連試験': item.document.theme,
        '公開状態': item.document.isPublic ? '公開中': '未公開',
        '正解/総計': item.isCompleted ? `${item.correctAnswers || 0}/${item.totalQuestions || 0}` : '-',
        'テスト結果': item.isCompleted ? item.score === 1 ? ' 合格':'不合格' : '未実施  ',
        '受験者': item.firstName + item.lastName,
        '実施日時': item.isCompleted ? dayjs(item.completedAt).format('YYYY-MM-DD HH:mm:ss') : '-',
      }
    })
    console.log(dataFormat, 'dataFormat')
    const csv = parse(dataFormat)
    const filename = encodeURIComponent(`テスト結果_${new Date().toLocaleString()}.csv`);
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