import prisma from "@/lib/prisma"
import dayjs from "dayjs"

// 类型定义
interface ListQuestionParams {
  // 分页参数
  page?: number
  pageSize?: number
  endDate?: string
  startDate?: string
  questionType?: string
  document?: string
  content?: string
  userName?: string
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
      endDate,
      startDate,
      questionType,
      document = '',
      content = '',
      userName = ''
    } = params

    const where: any = {
          AND: [
            { 
              questionType,
              content: {
                contains: content, 
                mode: 'insensitive',
              },
              createdDate: {
                lte: endDate ? dayjs(endDate).add(1, 'd').toISOString() : undefined,
                gte: startDate ? dayjs(startDate).toISOString() : undefined, 
              },
              document: {
                fileName: {
                  contains: document, 
                  mode: 'insensitive',
                },
              },
            },
            {
              user: {
                OR: [
                  { firstName: { contains: userName, mode: 'insensitive' } },
                  { lastName: { contains: userName, mode: 'insensitive' } },
                ],
              }
            },
            { delFlag: false } // 默认过滤已删除
          ].filter(Boolean)
        }

    // 并行查询
    const [total, documents] = await Promise.all([
      prisma.question.count({ where }),
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
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        orderBy: { [orderBy]: orderDirection },
      })
    ])

    return {
      data: documents,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
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