import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// 类型定义
interface ListDocumentsParams {
  // 分页参数
  page?: number
  pageSize?: number

  // 排序参数
  orderBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize'
  orderDirection?: 'asc' | 'desc'

  // 过滤参数
  fileType?: string
  search?: string
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
      search,
    } = params

    // 构建查询条件
    const where: any = {
      AND: [
        { fileType }, // 按文件类型过滤
        { 
          OR: search ? [
            { fileName: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ] : undefined
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
          userId: true,
          delFlag: true,
          fileName: true,
          pathName: true,
          fileType: true,
          filesize: true,
          description: true,
          createAt: true,
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