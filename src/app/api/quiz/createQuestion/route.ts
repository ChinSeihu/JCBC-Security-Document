import { NextResponse } from 'next/server'
// import { validateAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request, { params }) {
  try {
    // const { error: authError } = await validateAdmin(request)
    // if (authError) return authError

    // 2. 获取参数
    const quizId = params.quizId
    const { content, questionType, order } = await request.json()

    // 3. 数据校验
    if (!content || !questionType || !order) {
      return NextResponse.json(
        { error: '缺少必填字段: content/questionType/order' },
        { status: 400 }
      )
    }

    // 4. 检查关联 Quiz 是否存在
    const quizExists = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true }
    })
    if (!quizExists) {
      return NextResponse.json({ error: '测试不存在' }, { status: 404 })
    }

    // 5. 创建问题
    const question = await prisma.question.create({
      data: {
        quizId,
        content,
        questionType,
        order: parseInt(order)
      }
    })

    return NextResponse.json(question, { status: 201 })
    
  } catch (error) {
    console.error('[CREATE_QUESTION_ERROR]', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}