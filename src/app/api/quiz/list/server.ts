import { getUserList } from "@/lib"
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
  theme?: string
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
      theme = '',
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
                theme: {
                  contains: theme, 
                  mode: 'insensitive',
                },
              },
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
          createdAt: true,
          documentId: true,
          lastModifiedAt: true,
          lastModifiedDate: true,
          document: {
            select: {
              fileName: true,
              theme: true,
            }
          },
          quesOptions: {
            select: {
              id: true,
              content: true,
              isCorrect: true,
              order: true
            }
          }
        },
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        orderBy: { [orderBy]: orderDirection },
      })
    ])

    const userList = await getUserList()

    const data = documents.map((item: any) => {
      const CurrentUser = userList.find((it: any) => it.id === item.createdAt)
      const modifiedUser = userList.find((it: any) => it.id === item.lastModifiedAt)
      return {
        ...item,
        username: CurrentUser?.username,
        firstName: CurrentUser?.firstName,
        lastName: CurrentUser?.lastName,
        modifiedAt: ((modifiedUser?.lastName || '') + '　' + (modifiedUser?.firstName || '')).trim()
      }}
    ).filter((item: any) => `${item.firstName} ${item.lastName}`.includes(userName))

    return {
      data,
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