import { FILE_TYPE } from "@/constants";
import { validateUser } from "@/lib";
import prisma from "@/lib/prisma";

interface DocumentParams {
	filename: string;
	pathName: string
	fileSize: number;
	description?: string
}

export const documentCreate = async (params: DocumentParams) => {
  
  try {
    const user = await validateUser();

    const newDocument = await prisma.document.create({
      data: {
        // 必填字段
        fileName: params.filename,
        fileType: FILE_TYPE.PDF,
        filesize: params.fileSize, // 2MB
        pathName: params.pathName,
        description: params.description,
        lastModifiedAt: user.id as string,
        lastModifiedDate: new Date(),
        createdAt: user.id as string,
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