import { FILE_TYPE } from "@/constants";
import { validateUser } from "@/lib";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

interface DocumentParams {
	filename: string;
	pathName: string
	fileSize: number;
	description?: string;
  userId: string,
  deadline?: string,
  theme: string;
}

export const documentCreate = async (params: DocumentParams) => {
  
  try {
    const newDocument = await prisma.document.create({
      data: {
        // 必填字段
        fileName: params.filename,
        fileType: FILE_TYPE.PDF,
        filesize: params.fileSize, // 2MB
        pathName: params.pathName,
        description: params.description,
        lastModifiedAt: params.userId,
        lastModifiedDate: new Date(),
        createdAt: params.userId,
        createdDate: new Date(),
        theme: params.theme,
        deadline: params.deadline ? dayjs(params.deadline).toISOString() : null
      }
    })

    console.log("作成成功:", newDocument)
    return newDocument
  } catch (error) {
    console.error("作成失敗:", error)
    throw error
  }

} 