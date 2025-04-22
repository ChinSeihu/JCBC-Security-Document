import { ClientPrisma } from "@/constants/type";
import { getUserList, validateUser } from "@/lib";

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
        id: params.id
      }
    })

    console.log("更新成功:", params.id)
  } catch (error) {
    console.error('更新失敗:', error)
    throw new Error('Failed to fetch documents')
  }
}

export async function createTestStatus(params: { documentId: string, prisma: ClientPrisma }) {
  try {
    const { prisma, documentId } = params
    const userList = await getUserList()

    await Promise.all(userList.map(async (user: any) => (  
      await prisma.TestStatus.upsert({
        create: {
          userId: user.id,
          documentId,
        },
        update: {},
        where: {
          user_document_tenant: {
            userId: user.id,
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