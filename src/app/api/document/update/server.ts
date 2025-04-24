import prisma from "@/lib/prisma"

export async function handleDocumentUpdate({
	id, deadline, comment, userId
}: {id: string, deadline: string, comment: string, userId: string}): Promise<void> {
	try {
		const result = await prisma.document.update({
			data: {
				deadline,
				description: comment,
				lastModifiedAt: userId,
				lastModifiedDate: new Date(),
			},
			where: {
				id
			},
		})

		console.log("修正に成功:", result?.id)
	} catch (error) {
		console.error('修正に失敗:', error)
		throw new Error('ドキュメントの修正に失敗しました')
	} finally {
		await prisma.$disconnect()
	}
}