import { ClientPrisma } from "@/constants/type";
import prisma from "@/lib/prisma";
// 类型定义
interface IUpdateParams {
  // 分页参数
  id: string
  isPublic: boolean,
  userId: string,
  prisma: ClientPrisma
}

// ドキュメント公開状態更新
export async function documentStatusUpdate(params: IUpdateParams): Promise<void> {
  const { prisma } = params;
  try {      
    await prisma.document.update({
      data: {
        isPublic: params.isPublic,
        lastModifiedAt: params.userId,
        lastModifiedDate: new Date(),
      },
      where: {
        id: params.id,
        delFlag: false
      }
    })

    console.log("更新成功:", params.id)
  } catch (error) {
    console.error('更新失敗:', error)
    throw new Error('Failed to fetch documents')
  }
}

export async function createTestStatus(params: { documentId: string, prisma: ClientPrisma, targetIds: string[] }) {
  try {
    const { prisma: clientPrisma, documentId, targetIds } = params
    const publiced = (await prisma.testStatus.findMany({
      select: { userId: true },
      where: { documentId }
    }))?.map?.((it: any) => it.userId)

    const cancelUsers = filterUnique(publiced, targetIds) || [];

    await Promise.all(cancelUsers.map(async (userId: any) => (  
      await clientPrisma.TestStatus.update({
        data: {
          delFlag: true,
          lastModifiedDate: new Date()
        },
        where: {
          user_document_tenant: {
            userId: userId,
            documentId,
          }
        }
      })
    )));

    await Promise.all(targetIds.map(async (userId: any) => (  
      await clientPrisma.TestStatus.upsert({
        create: {
          userId: userId,
          documentId,
        },
        update: {
          delFlag: false,
          lastModifiedDate: new Date()
        },
        where: {
          user_document_tenant: {
            userId: userId,
            documentId,
          }
        }
      })
    )));
  } catch (error) {
    console.log('テスト状态の作成に失敗しました:' ,error)
    throw new Error('データ作成に失敗しました')
  }
}

const filterUnique = (source: string[], target: string[]): string[] => {
  const sourceSet = new Set(source);
  return Array.from(sourceSet.difference(new Set(target)));
}