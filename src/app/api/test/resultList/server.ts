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
  status?: '0' | '1' | '2'
  userName?: string,
  isCompleted?: 'true' | 'false',
  // 排序参数
  orderBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize'
  orderDirection?: 'asc' | 'desc'
}

interface PaginatedTestResult {
  data: any,
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// 核心查询函数
export async function resultList(params: ListQuestionParams): Promise<PaginatedTestResult> {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'createdDate',
      orderDirection = 'desc',
      startDate,
      endDate,
      isPublic,
      document = '',
      status,
      userName = '',
      isCompleted
    } = params

    const where: any = {
      AND: [
        { 
          document: {
            isPublic: isPublic && isPublic === PUBLIC_STATUS_ENUM.OPEN,
            fileName: { contains: document, mode: 'insensitive' }
          },
          lastModifiedDate: {
            lte: endDate ? dayjs(endDate).add(1, 'd').toISOString() : undefined,
            gte: startDate ? dayjs(startDate).toISOString() : undefined, 
          },
          isCompleted: isCompleted ? isCompleted === 'true' : undefined
        },
      ].filter(Boolean)
    }

    // 并行查询
    let TestStatus = await prisma.testStatus.findMany({
        select: {
          id: true,
          quizResult: {
            select: {
              score: true,
              totalQuestions: true,
              completedAt: true,
              correctAnswers: true,
            },
            orderBy: { completedAt: 'desc' }
          },
          userId: true,
          isCompleted: true,
          quizResultIds: true,
          documentId: true,
          lastModifiedDate: true,
          document: {
            select: {
              pathName: true,
              fileName: true,
              isPublic: true,
              id: true,
              deadline: true,
            }
          }
        },
        where,
        // skip: (page - 1) * pageSize,
        // take: Number(pageSize),
        orderBy: { [orderBy]: orderDirection },
      })

    if (status) {
      TestStatus = TestStatus.filter(item => {
        if (status === '1') {
          return item.isCompleted && item.quizResult?.[0]?.score === 1
        }
        return item.isCompleted && item.quizResult?.[0]?.score < 1
      })
    }

    const userList = await getUserList()

    const data = TestStatus.map((item: any) => {
      const CurrentUser = userList.find((it: any) => it.id === item.userId)

      return {
        ...item,
        username: CurrentUser?.username,
        firstName: CurrentUser?.firstName,
        lastName: CurrentUser?.lastName
      }}
    ).filter((item: any) => `${item.lastName} ${item.firstName}`.includes(userName))
    
    return {
      data,
      pagination: {
        total: TestStatus?.length || 0,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(TestStatus?.length || 0 / pageSize)
      }
    }
  } catch (error) {
    console.error('查询テスト結果テーブル失败:', error)
    throw new Error('Failed to fetch test results')
  } finally {
    await prisma.$disconnect()
  }
}