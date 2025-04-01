import { ClientPrisma } from "@/constants/type"

export async function handleQuizDelete(id: string, runPrisma: ClientPrisma): Promise<void> {
	try {
		const result = await runPrisma.question.update({
			data: {
				delFlag: true
			},
			where: {
				id
			},
		})

		console.log("削除に成功:", result?.id)
	} catch (error) {
		console.error('削除に失敗:', error)
		throw new Error('問題の削除に失敗しました')
	}
}

export async function handleOptionDelete(questionId: string, runPrisma: ClientPrisma): Promise<void> {
	try {
		await runPrisma.quesOption.updateMany({
			data: {
				delFlag: true
			},
			where: { questionId },
		})

		console.log("削除に成功:", questionId)
	} catch (error) {
		console.error('削除に失敗:', error)
		throw new Error('選択肢の削除に失敗しました')
	}
}

