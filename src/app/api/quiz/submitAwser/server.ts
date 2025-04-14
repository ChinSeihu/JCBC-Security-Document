import { ClientPrisma } from "@/constants/type";
import { Prisma } from "@prisma/client"

interface ListQuesOptionsParams {
    aswerList: any[],
    prisma: ClientPrisma
}

interface QuestionResponse {
    id: string;
    isCorrect: boolean;
    order: number;
    questionId: string;
}

export async function getQuestionOptions(params: ListQuesOptionsParams): Promise<QuestionResponse[]> {
  try {
    const { aswerList, prisma } = params

    const questionOption = await prisma.quesOption.findMany({
        where: {
          questionId: {
            in: aswerList.map((it: any) => it.questionId)
          },
        },
        select: {
          isCorrect: true,
          order: true,
          id: true,
          questionId: true,
        }
      })

    return questionOption
  } catch (error) {
    console.log('問題の選択項目の抽出に失敗しました:' ,error)
    throw new Error('データ抽出に失敗しました')
  }
}

interface QuizResultParam {
    questionOption: QuestionResponse[];
    documentId: string;
    userId: string
}
type QuizResultResponse = Prisma.QuizResultCreateManyInput

export async function createQuizResult(params: ListQuesOptionsParams & QuizResultParam): Promise<QuizResultResponse> {
  try {
    const { aswerList, userId, prisma, documentId, questionOption } = params

    const mistakeList = aswerList.filter((it: any) => {
        const currentOption = questionOption.filter(item => item.questionId === it.questionId)
        return it.answer.some((answer: number) => currentOption.find(op => (op.order == answer) && !op.isCorrect))
      })

      // 回答結果
      const quizResult = await prisma.quizResult.create({
        data: {
          userId,
          documentId,
          score: 1 - (mistakeList.length / aswerList.length),
          totalQuestions: aswerList.length,
          correctAnswers: aswerList.length - mistakeList.length,
        }
      })

    return quizResult
  } catch (error) {
    console.log('回答結果の作成に失敗しました:' ,error)
    throw new Error('データ作成に失敗しました')
  }
}

interface QuizAswerParam {
  quizResult: QuizResultResponse;
}

export async function createQuizAnswer(params: ListQuesOptionsParams & QuizAswerParam): Promise<void> {
  const { aswerList, quizResult, prisma } = params
  try {

    const quizAnswerData = aswerList.map((item: any) => ({
      resultId: quizResult.id as string,
      questionId: item.questionId,
      selectedOptions: item?.answer,
    }))

    //  回答を作成
    await prisma.quizAnswer.createMany({
      data: quizAnswerData
    })
  } catch (error) {
    console.log('回答の作成に失敗しました:' ,error)
    throw new Error('データ作成に失敗しました')
  }
}

interface TestStstusParam {
  quizResultId: string;
  userId: string;
  documentId: string;
  prisma: ClientPrisma
}
export async function createTestStatus(params: TestStstusParam): Promise<void> {
  const { documentId, userId, quizResultId, prisma } = params

  try {
    const record = await prisma.testStatus.findUnique({
      select: {
        id: true,
        quizResultIds: true 
      }, 
      where: { user_document_tenant: { userId, documentId } }
    })

    record?.quizResultIds.push(quizResultId)

    await prisma.testStatus.upsert({
      create: {
        quizResultIds: record?.quizResultIds || [quizResultId],
        userId,
        documentId,
        isCompleted: true
      },
      update: {
        quizResultIds: record?.quizResultIds || [quizResultId],
        userId,
        documentId,
        isCompleted: true
      },
      where: { id: record?.id, user_document_tenant: { userId, documentId } }
    })
  } catch (error) {
    console.log('テストステータスの作成に失敗しました:', error)
    throw new Error('データ作成に失敗しました')
  }
}