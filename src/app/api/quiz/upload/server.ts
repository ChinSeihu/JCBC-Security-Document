import { ClientPrisma } from "@/constants/type";

interface DocumentParams {
    runPrisma: ClientPrisma,
    questions: {
      documentId: string,
      content: string,
      questionType: string,
      id: string,
      quesOptions: any[]
    }[],
    userId: string,
}

export const upsertQuestionMany = async (params: DocumentParams) => {
  try {
    const result = await Promise.all(params.questions.map(async item => {
      const { documentId, content, questionType, id } = item;
      const data = await params.runPrisma.question.upsert({
        update: {
          documentId,
          content,
          questionType,
          lastModifiedAt: params.userId,
          lastModifiedDate: new Date()
        },
        create: {
          documentId,
          content,
          questionType,
          createdAt: params.userId,
        },
        where: {
          id
        }
      })
      item.quesOptions.forEach(it => it.questionId = data.id)
      return data;
    }))

    console.log("作成成功:", result)
    return result
  } catch (error) {
    console.error("作成失敗:", error)
    throw error
  }
} 

export const upsertQuesOptionsMany = async ({ runPrisma, processData }: {
    runPrisma: ClientPrisma,
    processData: any[]
}) => {
    const result = await Promise.all(processData.map(async (item: any) => {
      const orderMap: any = {}
      return await Promise.all(item.quesOptions.map(async (it: any) => {
        if (orderMap[it.order]) {
          console.log('選択肢オーダー番号が重複されました')
          throw '選択肢オーダー番号が重複されました';
        }
        orderMap[it.order] = true;
        return await runPrisma.quesOption.upsert({
          update: it,
          create: it,
          where: {
              id: it.id || Math.random().toString(16),
              questionId: it.questionId
          }
        })
      }))
    }))

    return result;
}