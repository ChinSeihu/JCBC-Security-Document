import prisma from "@/lib/prisma"

export const getQuestionInfo = async (questionId: string) => {
    try {
        const result = await prisma.question.findFirst({
            select: {
                documentId: true,
                content: true,
                questionType: true,
                id: true,
                quesOptions: {
                    select: {
                        questionId: true,
                        content: true,
                        isCorrect: true,
                        order: true,
                        id: true,
                    }
                }
            },
            where: {
                id: questionId,
            }
        })
        return result;
    } catch (error) {
        console.error('問題詳細の取得に失败:', error)
    throw new Error('問題詳細の取得に失败しました')
    } finally {
        await prisma.$disconnect()
    }
}
