import { validateUser } from "@/lib";
import prisma from "@/lib/prisma"

interface FilePathResponse {
	id: string;
	pathName: string;
	fileName: string
}

// ドキュメント公開状態更新
export async function getPublicFileInfo(documentId: string): Promise<FilePathResponse | null> {
	try {
		const result = await prisma.document.findFirst({
			select: {
				id: true,
				pathName: true,
				fileName: true
			},
			where: {
				isPublic: true,
				id: documentId
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

// ドキュメントに紐づけテスト状態を取得
export async function getUserTestStatus(fileInfo: FilePathResponse, userId: string){
	try {
		const result = await prisma.testStatus.findUnique({
			select: {
				id: true,
				isCompleted: true,
			},
			where: {
				user_document_tenant : {
					userId: userId,
					documentId: fileInfo.id
				}
			}
		})

		console.log("テストステータスの取得に成功:", result?.id)
		return result
	} catch (error) {
		console.error('テストステータスの取得に失敗:', error)
		throw new Error('テストステータスの取得に失敗')
	} finally {
		await prisma.$disconnect()
	}
}