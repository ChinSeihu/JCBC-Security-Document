import { NextResponse } from 'next/server'
// import { validateAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { HttpStatusCode } from 'axios'
import { currentUser } from '@clerk/nextjs/server'
import { checkDocumentExits, updateQuesOptions, updateQuestionItem } from './server'
import { ClientPrisma } from '@/constants/type'

export async function POST(request: Request) {
  try {
    const { content, questionType, documentId, quesOptions, questionId } = await request.json()
    console.log(content, questionType, documentId, quesOptions, questionId)
    // 3. 数据校验
    if (!content || !questionType || !quesOptions?.length || !questionId) {
      return NextResponse.json(
        { data: { message: 'パラメーター不備' }},
        { status: HttpStatusCode.BadRequest }
      )
    }

    prisma.$transaction(async (runPrisma: ClientPrisma) => {
      const user = await currentUser();
      if (!user?.id) throw new Error('userId is not defined...')
      // 4. 检查关联 document 是否存在
      const quizExists = await checkDocumentExits(runPrisma, documentId)

      if (!quizExists) {
        return NextResponse.json({ data:{ message: 'ドキュメントが存在しない' }}, { status: HttpStatusCode.NotFound })
      }

      await updateQuestionItem({
          documentId,
          content,
          questionType,
          runPrisma,
          userId: user.id,
          questionId
      })

      await updateQuesOptions({runPrisma, questionId, quesOptions })

    })
    return NextResponse.json({
      data: {
        success: true,
        message: '更新に成功しました',
      },
      status: HttpStatusCode.Ok
  })
  } catch (error) {
    console.error('[CREATE_QUESTION_ERROR]', error)
    return NextResponse.json(
      { data: { message: 'システムエラー'} },
      { status: HttpStatusCode.InternalServerError }
    )
  } finally {
    prisma.$disconnect();
  }
}