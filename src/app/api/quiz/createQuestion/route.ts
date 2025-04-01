import { NextResponse } from 'next/server'
// import { validateAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { HttpStatusCode } from 'axios'
import { currentUser } from '@clerk/nextjs/server'

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

    prisma.$transaction(async (runPrisma) => {
      const user = await currentUser();
      if (!user?.id) throw new Error('userId is not defined...')
            
      // 4. 检查关联 document 是否存在
      const quizExists = await runPrisma.document.findUnique({
        where: { id: documentId, delFlag: false },
        select: { id: true }
      })
      if (!quizExists) {
        return NextResponse.json({ data:{ message: 'ドキュメントが存在しない' }}, { status: HttpStatusCode.NotFound })
      }

      // 5. 创建问题
      const question = await runPrisma.question.create({
        data: {
          documentId,
          content,
          questionType,
          createdAt: user.id,
        }
      })

      const optionsList = quesOptions.map((item: any) => ({
        ...item,
        questionId: question.id
      }))
      const quesOption = await runPrisma.quesOption.createMany({
        data: optionsList
      })

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