import { PUBLIC_STATUS_ENUM } from "@/constants"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"

// 类型定义
interface ListDocumentsParams {
  // 分页参数
  page?: number
  pageSize?: number

  startDate?: string
  endDate?: string
  isPublic?: PUBLIC_STATUS_ENUM
  fileName?: string

  // 排序参数
  orderBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize'
  orderDirection?: 'asc' | 'desc'

  // 过滤参数
  fileType?: string
}

interface PaginatedDocuments {
  data: any,
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// 核心查询函数
export async function listDocuments(params: ListDocumentsParams): Promise<PaginatedDocuments> {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'lastModifiedDate',
      orderDirection = 'desc',
      fileType,
      endDate,
      startDate,
      isPublic
    } = params

    // 构建查询条件
    const where: any = {
      AND: [
        { 
          fileType,
          createdDate: {
            lte: endDate ? dayjs(endDate).add(1, 'd').toISOString() : undefined,
            gte: startDate ? dayjs(startDate).toISOString() : undefined, 
          },
          isPublic: isPublic && isPublic === PUBLIC_STATUS_ENUM.OPEN,
          fileName: {
            contains: params.fileName, 
            mode: 'insensitive',
          },
        },
        { delFlag: false } // 默认过滤已删除
      ].filter(Boolean)
    }

    // 并行查询
    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        select: {
          id: true,
          createdAt: true,
          createdDate: true,
          delFlag: true,
          fileName: true,
          pathName: true,
          fileType: true,
          filesize: true,
          description: true,
          isPublic: true,
          lastModifiedAt: true,
          lastModifiedDate: true,
          user: {
            select: {
              lastName: true,
              firstName: true
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