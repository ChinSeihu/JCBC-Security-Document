import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { documentStatusUpdate } from './server';
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
