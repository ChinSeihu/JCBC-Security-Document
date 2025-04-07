import { ClientPrisma } from "@/constants/type"
import prisma from "@/lib/prisma"

export const checkDocumentExits = async (runPrisma: ClientPrisma, documentId: string) => {
  try {
    return await runPrisma.document.findUnique({
          where: { id: documentId, delFlag: false },
          select: { id: true }
      })
  } catch (error) {
    console.error('ドキュメントのチェック失敗しました:', error)
    throw new Error('ドキュメントのチェック失敗しました')
  }
}

export const updateQuestionItem = async ({
    runPrisma,
    documentId,
    content,
    questionType,
    userId,
    questionId
}: {
    runPrisma: ClientPrisma,
    documentId: string,
    content: string,
    questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE',
    userId: string,
    questionId: string
}) => {
  try {
    return await runPrisma.question.update({
        data: {
          documentId,
          content,
          questionType,
          lastModifiedAt: userId
        },
        where: {
          id: questionId,
        }
      })
  } catch (error) {
    console.error('問題の更新に失敗しました:', error)
    throw new Error('問題の更新に失敗しました')
  }
}

export const updateQuesOptions = async ({ runPrisma, questionId, quesOptions }: {
    runPrisma: ClientPrisma,
    questionId: string,
    quesOptions: any[]
}) => {
  try {
    const updateList = quesOptions.map(item => {
       return runPrisma.quesOption.update({
        data: item,
        where: {
          id: item.id,
          questionId
        }
      })
    })
    
    prisma.$transaction(updateList)
  } catch (error) {
    console.error('選択肢の更新に失敗しました:', error)
    throw new Error('問題の更新に失敗しました')
  }
} 