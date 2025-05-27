// app/api/read-pdf/route.js (App Router)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getFileInfo } from './server';
import { HttpStatusCode } from 'axios';
import { readFile } from 'fs/promises';
import { getSearchParams } from '@/lib';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = getSearchParams(searchParams);
    const fileInfo = await getFileInfo(params.documentId);
    // 构建文件路径
    const filePath = path.join(
      process.cwd(), 
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

    const fileBuffer = await readFile(filePath);

    console.log(fileInfo, 'fileInfo>>>>>>>>>')
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf", // 根据实际文件类型调整
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileInfo.fileName)}`,
      },
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'システムエラー' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}