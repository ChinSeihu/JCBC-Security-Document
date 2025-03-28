import { FILE_TYPE } from "@/constants";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

interface DocumentParams {
	filename: string;
	pathName: string
	fileSize: number;
	description?: string
}

export const documentCreate = async (params: DocumentParams) => {
  
  try {
    const user = await currentUser();
    if (!user?.id) throw new Error('userId is not defined...')

    const newDocument = await prisma.document.create({
      data: {
        // 必填字段
        fileName: params.filename,
        fileType: FILE_TYPE.PDF,
        filesize: params.fileSize, // 2MB
        pathName: params.pathName,
        description: params.description,
        lastModifiedAt: user.id,
        lastModifiedDate: new Date(),
        createdAt: user.id,
        createdDate: new Date()
      }
    })

    console.log("作成成功:", newDocument)
    return newDocument
  } catch (error) {
    console.error("作成失敗:", error)
    throw error
  }

} 