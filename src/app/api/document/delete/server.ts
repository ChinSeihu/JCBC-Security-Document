import prisma from "@/lib/prisma"

interface FilePathResponse {
	id: string;
	pathName: string;
	fileName: string
}

// ドキュメント公開状態更新
export async function getPublicFileInfo(id: string): Promise<FilePathResponse | null> {
	try {
		const result = await prisma.document.findFirst({
			select: {
				id: true,
				pathName: true,
				fileName: true
			},
			where: {
				isPublic: false,
				id
			},
			orderBy: [{lastModifiedDate: "desc"}]
		})

		console.log("取得に成功:", result?.id)
		return result
	} catch (error) {
		console.error('取得に失敗:', error)
		throw new Error('Failed to fetch documents')
	} finally {
		await prisma.$disconnect()
	}
}

export async function handleDocumentDelete(id: string): Promise<void> {
	try {
		const result = await prisma.document.update({
			data: {
				delFlag: true
			},
			where: {
				isPublic: false,
				id
			},
		})

		console.log("削除に成功:", result?.id)
	} catch (error) {
		console.error('削除に失敗:', error)
		throw new Error('ドキュメントの削除に失敗しました')
	} finally {
		await prisma.$disconnect()
	}
}