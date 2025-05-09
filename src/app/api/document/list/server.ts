import { PUBLIC_STATUS_ENUM } from "@/constants"
import { getUserList } from "@/lib"
import prisma from "@/lib/prisma"
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
  theme?: string
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
      isPublic,
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
          theme: {
            contains: params.theme, 
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
          theme: true,
          filesize: true,
          description: true,
          deadline: true,
          isPublic: true,
          lastModifiedAt: true,
          lastModifiedDate: true,
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

      return {
        ...item,
        username: CurrentUser?.username,
        firstName: CurrentUser?.firstName,
        lastName: CurrentUser?.lastName
      }}
    )

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