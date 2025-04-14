import { NextRequest, NextResponse } from 'next/server'
// import { validateAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { HttpStatusCode } from 'axios'
import { getQuestionOptions, createQuizResult, createQuizAnswer, createTestStatus } from './server'
import { validateUser } from '@/lib'

export async function POST(request: NextRequest) {
  try {
    const { aswerList, documentId } = await request.json()
    console.log(aswerList, documentId)
    // 3. 数据校验
    if (!aswerList?.length || !documentId) {
      return NextResponse.json(
        { data: { message: 'パラメーター不備' }},
        { status: HttpStatusCode.BadRequest }
      )
    }
    let quizResultId = null
    await prisma.$transaction(async (prismaClient) => {
      const user = await validateUser(request);

      const questionOption = await getQuestionOptions({ aswerList, prisma: prismaClient });
      console.log(questionOption, 'questionOption>')
      // 回答結果
      const quizResult = await createQuizResult({aswerList, userId: user.id, prisma: prismaClient, documentId, questionOption})
      quizResultId = quizResult.id as string;
      await createQuizAnswer({ aswerList, quizResult, prisma: prismaClient })
      await createTestStatus({ prisma: prismaClient, userId: user.id, documentId, quizResultId })
    })
    return NextResponse.json({
      data: {
        success: true,
        quizResultId: quizResultId,
        message: '提出に成功しました',
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