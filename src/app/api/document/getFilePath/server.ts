import prisma from "@/lib/prisma"

interface FilePathResponse {
	id: string;
	pathName: string;
	fileName: string
}

// ドキュメント公開状態更新
export async function getPublicFilePath(): Promise<FilePathResponse> {
	try {
		const result = await prisma.document.findFirst({
			select: {
				id: true,
				pathName: true,
				fileName: true
			},
			where: {
				isPublic: true
			},
			orderBy: [{lastModifiedDate: "desc"}]
		})

		if (!result) {
			throw new Error('ファイルの取得に失敗しました')
		}

		console.log("取得に成功:", result?.id)
		return result
	} catch (error) {
		console.error('取得に失敗:', error)
		throw new Error('Failed to fetch documents')
	} finally {
		await prisma.$disconnect()
	}
}