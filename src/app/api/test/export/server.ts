import { PUBLIC_STATUS_ENUM } from "@/constants"
import { getUserList } from "@/lib"
import prisma from "@/lib/prisma"
import dayjs from "dayjs"

// 类型定义
interface ListQuestionParams {
  // 分页参数
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  isPublic?: PUBLIC_STATUS_ENUM
  document?: string
  score?: string
  userName?: string
  // 排序参数
  orderBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize'
  orderDirection?: 'asc' | 'desc'
}

// 核心查询函数
export async function resultList(params: ListQuestionParams): Promise<any[]> {
  try {
    const {
      orderBy = 'completedAt',
      orderDirection = 'desc',
      startDate,
      endDate,
      isPublic,
      document = '',
      score,
      userName = ''
    } = params

    const where: any = {
      AND: [
        { 
          completedAt: {
            lte: endDate ? dayjs(endDate).add(1, 'd').toISOString() : undefined,
            gte: startDate ? dayjs(startDate).toISOString() : undefined, 
          },
          document: {
            isPublic: isPublic && isPublic === PUBLIC_STATUS_ENUM.OPEN,
            fileName: { contains: document, mode: 'insensitive' }
          },
          score: score ? {
            gte: Number(score),
            lt: score === '0' ? 1 : undefined
          } : undefined
        }
      ].filter(Boolean)
    }

    // 并行查询
    const documents = await prisma.quizResult.findMany({
      select: {
        id: true,
        score: true,
        totalQuestions: true,
        completedAt: true,
        correctAnswers: true,
        documentId: true,
        document: {
          select: {
            pathName: true,
            fileName: true,
            isPublic: true,
            id: true,
          }
        }
      },
      where,
      orderBy: { [orderBy]: orderDirection },
    })

    const userList = await getUserList()

    const data = documents.map((item: any) => {
      const CurrentUser = userList.find((it: any) => it.id === item.createdAt)

      return {
        ...item,
        username: CurrentUser?.username,
        firstName: CurrentUser?.firstName,
        lastName: CurrentUser?.lastName
      }}
    ).filter((item: any) => `${item.firstName} ${item.lastName}`.includes(userName))

    return data;
  } catch (error) {
    console.error('查询テスト結果テーブル失败:', error)
    throw new Error('Failed to fetch test results')
  } finally {
    await prisma.$disconnect()
  }
}