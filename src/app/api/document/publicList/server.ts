import prisma from "@/lib/prisma"

export async function getPublicList(documentId: string){
	try {
		const result = await prisma.testStatus.findMany({
			select: {
				id: true,
				isCompleted: true,
				 userId: true
			},
			where: {
				documentId,
				delFlag: false
			}
		})

		console.log("公開リストの取得に成功:", result?.id)
		return result
	} catch (error) {
		console.error('公開リストの取得に失敗:', error)
		throw new Error('公開リストの取得に失敗')
	} finally {
		await prisma.$disconnect()
	}
}