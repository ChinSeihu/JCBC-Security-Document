import { validateUser } from "@/lib";
import prisma from "@/lib/prisma"

// 类型定义
interface IUpdateParams {
  // 分页参数
  id: string
  isPublic: boolean,
  userId: string
}

// ドキュメント公開状態更新
export async function documentStatusUpdate(params: IUpdateParams): Promise<void> {
  try {      
    await prisma.document.update({
      data: {
        isPublic: params.isPublic,
        lastModifiedAt: params.userId,
        lastModifiedDate: new Date(),
      },
      where: {
        id: params.id
      }
    })

    console.log("更新成功:", params.id)
  } catch (error) {
    console.error('更新失敗:', error)
    throw new Error('Failed to fetch documents')
  } finally {
    await prisma.$disconnect()
  }
}

export async function checkPublicStatus(): Promise<boolean> {
  try {      
    const result = await prisma.document.findFirst({
      select: {
        isPublic: true,
        fileName: true
      },
      where: {
        isPublic: true
      }
    })

    return !!result
  } catch (error) {
    throw new Error('Failed to fetch documents')
  } finally {
    await prisma.$disconnect()
  }
}