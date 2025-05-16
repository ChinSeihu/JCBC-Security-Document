import { PUBLIC_STATUS_ENUM } from "@/constants"
import prisma from "@/lib/prisma"
import { listQuestion } from "../list/server"

// 类型定义
interface ListQuestionParams {
  // 分页参数
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  isPublic?: PUBLIC_STATUS_ENUM
  document?: string
  status?: '0' | '1' | '2'
  userName?: string,
  isCompleted?: 'true' | 'false',
  // 排序参数
  orderBy?: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize'
  orderDirection?: 'asc' | 'desc'
}

// 核心查询函数
export async function exportList(params: ListQuestionParams): Promise<any[]> {
  try {
    const result = await listQuestion({ ...params, pageSize: 99999 })
    return result?.data?.map((item: any) => {
      if (!item?.quesOptions?.length) return [item];
      return item?.quesOptions.map((it: any) => ({
        optionContent: it?.content,
        optionCorrect: it?.isCorrect,
        optionOrder: it?.order,
        optionId: it.id,
        ...item
      }))
    }).flat();
  } catch (error) {
    console.error('查询テスト結果テーブル失败:', error)
    throw new Error('Failed to fetch test results')
  } finally {
    await prisma.$disconnect()
  }
}