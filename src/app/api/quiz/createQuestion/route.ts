import { NextResponse } from 'next/server'
// import { validateAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { HttpStatusCode } from 'axios'
import { checkDocumentExits, createQuesOptions, createQuestionItem } from './server'
import { ClientPrisma } from '@/constants/type'
import { validateUser } from '@/lib'

export async function POST(request: Request) {
  try {
    const { content, questionType, documentId, quesOptions } = await request.json()
    console.log(content, questionType, documentId, quesOptions)
    // 3. 数据校验
    if (!content || !questionType || !quesOptions?.length) {
      return NextResponse.json(
        { data: { message: 'パラメーター不備' }},
        { status: HttpStatusCode.BadRequest }
      )
    }

    prisma.$transaction(async (runPrisma: ClientPrisma) => {
      const user = await validateUser();
      // 4. 检查关联 document 是否存在
      const quizExists = await checkDocumentExits(runPrisma, documentId)

      if (!quizExists) {
        return NextResponse.json({ data:{ message: 'ドキュメントが存在しない' }}, { status: HttpStatusCode.NotFound })
      }

      // 5. 创建问题
      const question = await createQuestionItem({
          documentId,
          content,
          questionType,
          runPrisma,
          userId: user.id as string
      })

      await createQuesOptions({runPrisma, questionId: question.id, quesOptions })

    })
    return NextResponse.json({
      data: {
        success: true,
        message: '追加に成功しました',
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