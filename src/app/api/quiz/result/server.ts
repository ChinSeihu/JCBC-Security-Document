import prisma from "@/lib/prisma";
import { pick } from "@/lib/utils";

interface IUserDocParams {
  documentId: string;
  userId: string
}

export async function getTestStatus(params: IUserDocParams) {
  try {
    const { documentId, userId } = params

    const testStatus = await prisma.testStatus.findFirst({
        where: {
            userId,
            documentId,
        },
        select: {
          id: true,
          quizResultIds: true,
        }
      })

    return testStatus
  } catch (error) {
    console.log('テスト状態の抽出に失敗しました:' ,error)
    throw new Error('データ抽出に失敗しました')
  }
}

export async function getQuizResult(params: IUserDocParams) {
  try {
    const { documentId, userId } = params
    const testStatus = await getTestStatus(params)

    const quizResult = await prisma.quizResult.findFirst({
        where: {
          userId,
          documentId,
          id: {
            in: testStatus?.quizResultIds
          }
        },
        select: {
          id: true,
          userId: true,
          documentId: true,
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          completedAt: true,
        },
        orderBy: {
          completedAt: "desc"
        }
      })

    return quizResult
  } catch (error) {
    console.log('テスト結果の抽出に失敗しました:' ,error)
    throw new Error('データ作成に失敗しました')
  }
}

export interface IQuizResultResponse {
  id: string;
  userId: string;
  documentId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
  quizAnswers?: {
    questionText: string;
    selectedInfos: {
      content: string;
      isCorrect: boolean;
      order: number;
    }[]
  }[];

}

export async function getResponse(params: IUserDocParams): Promise<IQuizResultResponse | null> {
  const result = await getQuizResult(params);
  const quizAnswer = await getQuizAnswer(result?.id)

  if (!result) return null;

  const quizAnswers = quizAnswer.map((item: any) => {
    const questionText = item.question.content
    const selectedInfos = item.question.quesOptions.filter((it: any) => item.selectedOptions.includes(it.order as any))  
    return {
      questionText,
      selectedInfos
    }
  })

  return {
    ...(pick(["id","userId","documentId","score","totalQuestions","correctAnswers","completedAt"], result)),
    quizAnswers
  }
}

export const getQuizAnswer = async (resultId: string = ``) => {
  try {
    const quizAnswer = await prisma.quizAnswer.findMany({
        where: {
            resultId,
        },
        select: {
          id: true,
          selectedOptions: true,
          question: {
            select: {
              content: true,
              quesOptions: {
                select: {
                  order: true,
                  content: true,
                  isCorrect: true
                },
                where: {
                  delFlag: false
                }
              }
            },
          }
        }
      })

    return quizAnswer
  } catch (error) {
    console.log('データの抽出に失敗しました:' ,error)
    throw new Error('データ抽出に失敗しました')
  }
}