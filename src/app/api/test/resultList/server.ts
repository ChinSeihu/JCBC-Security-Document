import prisma from "@/lib/prisma"

// 类型定义
interface ListQuestionParams {
  // 分页参数
  page?: number
  pageSize?: number

  // 排序参数
  orderBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize'
  orderDirection?: 'asc' | 'desc'
}

interface PaginatedQuestion {
  data: any,
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// 核心查询函数
export async function resultList(params: ListQuestionParams): Promise<PaginatedQuestion> {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'completedAt',
      orderDirection = 'desc',
    } = params

    // 并行查询
    const [total, documents] = await Promise.all([
      prisma.quizResult.count(),
      prisma.quizResult.findMany({
        select: {
          id: true,
          score: true,
          totalQuestions: true,
          completedAt: true,
          correctAnswers: true,
          user: {
            select: {
              lastName: true,
              firstName: true,
              userId: true
            }
          },
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
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [orderBy]: orderDirection },
      })
    ])

    return {
      data: documents,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error) {
    console.error('查询テスト結果テーブル失败:', error)
    throw new Error('Failed to fetch test results')
  } finally {
    await prisma.$disconnect()
  }
}