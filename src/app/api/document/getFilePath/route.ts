// app/api/read-pdf/route.js (App Router)
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPublicFilePath } from './server';
import { HttpStatusCode } from 'axios';

export async function GET() {
  try {
    // const { searchParams } = new URL(request.url);
    // const filename = searchParams.get('filename');

    // if (!filename) {
    //   return NextResponse.json(
    //     { error: 'Missing filename parameter' },
    //     { status: 400 }
    //   );
    // }
    const fuleInfo = await getPublicFilePath();

    // 构建文件路径
    const filePath = path.join(
      process.cwd(), 
      'public/',
      fuleInfo.pathName
    );

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: HttpStatusCode.NotFound }
      );
    }

    // 返回 PDF 数据流
    return NextResponse.json({
      data: {...fuleInfo, success: true},
      status: HttpStatusCode.Ok
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}