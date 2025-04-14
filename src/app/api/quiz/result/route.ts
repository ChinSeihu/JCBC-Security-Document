import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { HttpStatusCode } from 'axios'
import { getResponse } from './server'
import { validateUser } from '@/lib';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    if (!documentId) {
      return NextResponse.json(
        { data: { message: 'パラメーター不備' }},
        { status: HttpStatusCode.BadRequest }
      )
    }
    
    const user = await validateUser(request);

    const quizResultInfo = await getResponse({ userId: user.id, documentId })

    return NextResponse.json({
      data: {
        success: true,
        quizResultInfo,
        message: '取得に成功しました',
      },
      status: HttpStatusCode.Ok
    })
  } catch (error) {
    return NextResponse.json(
      { data: { message: 'システムエラー'} },
      { status: HttpStatusCode.InternalServerError }
    )
  } finally {
    prisma.$disconnect();
  }
}