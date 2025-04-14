import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { resultList } from './server';
import { getSearchParams } from '@/lib/actions';
import { parse } from 'json2csv'
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = getSearchParams(searchParams);
    
    const result = await resultList(params)

    const dataFormat = result.map((item, idx) => {
      return {
        '番号': idx + 1,
        '関連ドキュメント': item.document.fileName,
        '公開状態': item.document.isPublic ? '公開中': '未公開',
        '正解/総計': `${item.correctAnswers}/${item.totalQuestions}`,
        'テスト結果': item.score === 1 ? ' 合格':'不合格',
        '受験者': item.username,
        '実施日時': dayjs(item.completedAt).format('YYYY-MM-DD HH:mm:ss'),
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