import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// 核心查询函数
export async function listFromTestStatus(userId: string): Promise<Prisma.DocumentCreateInput[]> {
  try {
    // 并行查询
      const publicDocument = await prisma.document.findMany({
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
          deadline: true,
          isPublic: true,
          lastModifiedAt: true,
          lastModifiedDate: true,
        },
        where: {
          isPublic: true,
          testStatus: {
            some: {
              userId,
              delFlag: false
            },
          }
        },
        orderBy: { 'lastModifiedDate': 'desc' },
      })

    return publicDocument
  } catch (error) {
    console.error('查询文档列表失败:', error)
    throw new Error('Failed to fetch documents')
  } finally {
    await prisma.$disconnect()
  }
}