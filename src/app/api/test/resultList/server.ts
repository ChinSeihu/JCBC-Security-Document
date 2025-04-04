import { PUBLIC_STATUS_ENUM } from "@/constants"
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
        },
        {
          user: {
            OR: [
              { firstName: { contains: userName, mode: 'insensitive' } },
              { lastName: { contains: userName, mode: 'insensitive' } },
            ],
          }
        }
      ].filter(Boolean)
    }

    // 并行查询
    const [total, documents] = await Promise.all([
      prisma.quizResult.count({ where }),
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
    console.error('查询テスト結果テーブル失败:', error)
    throw new Error('Failed to fetch test results')
  } finally {
    await prisma.$disconnect()
  }
}