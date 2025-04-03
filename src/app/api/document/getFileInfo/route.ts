// app/api/read-pdf/route.js (App Router)
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPublicFileInfo, getUserTestStatus } from './server';
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
    const fileInfo = await getPublicFileInfo();
    // 构建文件路径
    const filePath = path.join(
      process.cwd(), 
      'public/',
      fileInfo?.pathName || ''
    );

    // 检查文件是否存在
    if (!fileInfo || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { 
          data: null, 
          message: '公開されているファイルを見つけません',
          status: HttpStatusCode.NotFound 
        }
      );
    }

    const testStatus = await getUserTestStatus(fileInfo);
    const pathUrl = `${process.cwd()}/public` + fileInfo.pathName

    // 返回 PDF 数据流
    return NextResponse.json({
      data: {...fileInfo, pathUrl,success: true, testStatus },
      status: HttpStatusCode.Ok
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}