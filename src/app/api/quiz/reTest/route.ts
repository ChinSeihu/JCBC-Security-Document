import { NextResponse } from 'next/server'
// import { validateAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { HttpStatusCode } from 'axios'
import { currentUser } from '@clerk/nextjs/server'
import { updateTestStatus } from './server'

export async function POST(request: Request) {
  try {
    const { documentId, userId } = await request.json()
    console.log(documentId, userId)
    // 3. 数据校验
    if (!documentId) {
      return NextResponse.json(
        { data: { message: 'パラメーター不備' }},
        { status: HttpStatusCode.BadRequest }
      )
    }

    await prisma.$transaction(async (prismaClient) => {
      const user = await currentUser();
      if (!user?.id) throw new Error('userId is not defined...')

      // テスト状態を更新する
      await updateTestStatus({userId: userId || user.id, prisma: prismaClient, documentId})
    })
    return NextResponse.json({
      data: {
        success: true,
        message: '状態の更新に成功しました',
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