// app/api/read-pdf/route.js (App Router)
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPublicFileInfo, handleDocumentDelete } from './server';
import { HttpStatusCode } from 'axios';

export async function POST(request: Request) {
  try {
    const params = await request.json()
    const { id, isPublic } = params;

    if (isPublic) {
      return NextResponse.json(
        { 
          data: null, 
          message: '公開中のファイルが削除できません！',
          status: HttpStatusCode.BadRequest 
        }
      );
    }

    const fileInfo = await getPublicFileInfo(id);

    const filePath = path.join(
      process.cwd(), 
      'public/',
      fileInfo?.pathName || ''
    );

    if (!fileInfo || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { 
          data: null, 
          message: '該当のファイルがみつかりませんでした',
          status: HttpStatusCode.NotFound 
        }
      );
    }

    await fs.unlink(filePath, async (err) => {
      console.log(err, 'err>>>>')
      if (err) throw 'ファイルの削除に失敗しました！';

      await handleDocumentDelete(id)
    });

    // 返回 PDF 数据流
    return NextResponse.json({
      data: { success: true, message: 'ファイルの削除に成功しました！' },
      status: HttpStatusCode.Ok
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}