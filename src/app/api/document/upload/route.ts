import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';
import { writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { documentCreate } from './server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No files received' }, 
        { status: HttpStatusCode.BadRequest }
      );
    }

    // 生成唯一文件名
    const filename = `${uuidv4()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await documentCreate({
      filename: file.name,
      pathName: `/upload/${filename}`,
      fileSize: file.size
    })
    
    // 保存到 public/upload
    await writeFile(
      `${process.cwd()}/public/upload/${filename}`,
      new Uint8Array(buffer)
    );

    return NextResponse.json({
      status: HttpStatusCode.Ok,
      data: {
        filename,
        success: true,
        url: `/upload/${filename}`,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: HttpStatusCode.InternalServerError }
    );
  }
}