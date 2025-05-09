import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { documentCreate } from './server';
import { validateUser } from '@/lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const deadline = formData.get('deadline') as string;
    const theme = formData.get('theme') as string;
    const user = await validateUser(request);
    
    if (!file) {
      return NextResponse.json(
        { error: 'No files received' }, 
        { status: HttpStatusCode.BadRequest }
      );
    }

    // 生成唯一文件名
    const filename = `${uuidv4()}-${Date.now()}.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await documentCreate({
      filename: file.name,
      pathName: `${process.env.NEXT_PUBLIC_UPLOAD_DIR}/${filename}`,
      fileSize: file.size,
      userId: user.id,
      description,
      deadline,
      theme
    })
    
    // 保存到 public/upload
    await writeFile(
      `${process.cwd()}/${process.env.NEXT_PUBLIC_UPLOAD_DIR}/${filename}`,
      new Uint8Array(buffer)
    );

    return NextResponse.json({
      status: HttpStatusCode.Ok,
      data: {
        filename,
        success: true,
        url: `${process.env.NEXT_PUBLIC_UPLOAD_DIR}/${filename}`,
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