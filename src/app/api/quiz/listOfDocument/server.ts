import prisma from "@/lib/prisma"

interface ListQuestionParams {
  documentId: string
}

interface QuestionResponse {
  data: any
}

// 核心查询函数
export async function listQuestionAndAwser(params: ListQuestionParams): Promise<QuestionResponse> {
  try {
    const { documentId } = params

    const questions = await prisma.question.findMany({
        select: {
          id: true,
          questionType: true,
          documentId: true,
          content: true,
          quesOptions: {
            select: {
              id: true,
              content: true,
              isCorrect: true,
              order: true
            }
          }
        },
        where: { delFlag: false, documentId },
      })

    return {
      data: questions
    }
  } catch (error) {
    console.error('抽出に失敗しました:', error)
    throw new Error('Failed to fetch documents')
  } finally {
    await prisma.$disconnect()
  }
}