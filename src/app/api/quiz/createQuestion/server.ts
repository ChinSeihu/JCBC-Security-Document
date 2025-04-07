import { ClientPrisma } from "@/constants/type"

export const checkDocumentExits = async (runPrisma: ClientPrisma, documentId: string) => {
    return await runPrisma.document.findUnique({
        where: { id: documentId, delFlag: false },
        select: { id: true }
    })
}

export const createQuestionItem = async ({
    runPrisma,
    documentId,
    content,
    questionType,
    userId
}: {
    runPrisma: ClientPrisma,
    documentId: string,
    content: string,
    questionType: string,
    userId: string
}) => {
    return await runPrisma.question.create({
        data: {
          documentId,
          content,
          questionType,
          createdAt: userId,
        }
      })
}

export const createQuesOptions = async ({ runPrisma, questionId, quesOptions }: {
    runPrisma: ClientPrisma,
    questionId: string,
    quesOptions: any[]
}) => {
    const optionsList = quesOptions.map((item: any) => ({
      ...item,
      questionId
    }))
    await runPrisma.quesOption.createMany({
    data: optionsList
    })
} 