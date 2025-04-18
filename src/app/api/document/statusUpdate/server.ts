import { validateUser } from "@/lib";
import prisma from "@/lib/prisma"

// 类型定义
interface IUpdateParams {
  // 分页参数
  id: string
  isPublic: boolean,
  userId: string
}

// ドキュメント公開状態更新
export async function documentStatusUpdate(params: IUpdateParams): Promise<void> {
  try {      
    await prisma.document.update({
      data: {
        isPublic: params.isPublic,
        lastModifiedAt: params.userId,
        lastModifiedDate: new Date(),
      },
      where: {
        id: params.id
      }
    })

    console.log("更新成功:", params.id)
  } catch (error) {
    console.error('更新失敗:', error)
    throw new Error('Failed to fetch documents')
  } finally {
    await prisma.$disconnect()
  }
}

// export async function createQuizResult(params: any) {
//   try {
//     const { aswerList, userId, prisma, documentId, questionOption } = params

//     const mistakeList = aswerList.filter((it: any) => {
//         const currentOption = questionOption.filter(item => item.questionId === it.questionId)
//         return it.answer.some((answer: number) => currentOption.find(op => (op.order == answer) && !op.isCorrect))
//       })

//       // 回答結果
//       const quizResult = await prisma.quizResult.create({
//         data: {
//           userId,
//           documentId,
//         }
//       })

//     return quizResult
//   } catch (error) {
//     console.log('回答結果の作成に失敗しました:' ,error)
//     throw new Error('データ作成に失敗しました')
//   }
// }