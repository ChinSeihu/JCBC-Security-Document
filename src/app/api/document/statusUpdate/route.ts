import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { checkPublicStatus, documentStatusUpdate } from './server';
import { validateUser } from '@/lib';

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()
    const user = await validateUser(request);
    
    const { id, isPublic } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const checkPublicExist = await checkPublicStatus()

    if (checkPublicExist && isPublic) {
      return NextResponse.json({
        status: HttpStatusCode.Ok,
        data: {
          success: false,
          message: `公開中のファイルが存在であるので、更新できません！`
        },
      });
    }

    await documentStatusUpdate({ id, isPublic, userId: user.id })

    return NextResponse.json({
      status: HttpStatusCode.Ok,
      data: {
        success: true,
        message: '更新に成功しました！'
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
