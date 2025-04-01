import { ClientPrisma } from "@/constants/type";

interface TestStstusParam {
  userId: string;
  documentId: string;
  prisma: ClientPrisma
}
export async function updateTestStatus(params: TestStstusParam): Promise<void> {
  const { documentId, userId, prisma } = params

  try {
    await prisma.testStatus.update({
      data: {
        isCompleted: false
      }, 
      where: { user_document_tenant: { userId, documentId } }
    })

  } catch (error) {
    console.log('テストステータスの更新に失敗しました:', error)
    throw new Error('データ更新に失敗しました')
  }
}