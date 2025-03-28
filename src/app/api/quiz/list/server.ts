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
export async function listQuestion(params: ListQuestionParams): Promise<PaginatedQuestion> {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'lastModifiedDate',
      orderDirection = 'desc',
    } = params

    // 并行查询
    const [total, documents] = await Promise.all([
      prisma.question.count({ where: { delFlag: false } }),
      prisma.question.findMany({
        select: {
          id: true,
          questionType: true,
          content: true,
          createdDate: true,
          user: {
            select: {
              lastName: true,
              firstName: true
            }
          },
          documentId: true,
          document: {
            select: {
              fileName: true
            }
          }
        },
        where: { delFlag: false },
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
    console.error('查询文档列表失败:', error)
    throw new Error('Failed to fetch documents')
  } finally {
    await prisma.$disconnect()
  }
}