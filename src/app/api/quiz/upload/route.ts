import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { validateUser } from '@/lib';
import { parseCsv } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { ClientPrisma } from '@/constants/type';
import { upsertQuesOptionsMany, upsertQuestionMany } from './server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    const csvDatas = await parseCsv(buffer)
    console.log(csvDatas, '<<<<<<<<<<<<<<,csvDatas')

    prisma.$transaction(async (runPrisma: ClientPrisma) => {
      const user = await validateUser(request);
      const documentIdSet = new Set(csvDatas.map((it: any) => it.documentId))
      // 4. 检查关联 document 是否存在
      const quizExists = await runPrisma.document.findMany({
        where: { 
          id: {
            in: Array.from(documentIdSet)
          },
          delFlag: false 
        },
        select: { id: true }
    })

      if (quizExists.length !== documentIdSet.size) {
        return NextResponse.json({ data:{ message: '存在ないドキュメントIDがあります' }}, { status: HttpStatusCode.NotFound })
      }

      const processData: any = handleProcess(csvDatas);
      console.log(processData, '<<<<<<<<<<<<<processData')

      // 5. 创建问题
      await upsertQuestionMany({
          questions: processData,
          runPrisma,
          userId: user.id as string
      })

      await upsertQuesOptionsMany({ runPrisma, processData })

    })

    return NextResponse.json({
      status: HttpStatusCode.Ok,
      data: {
        success: true
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: HttpStatusCode.InternalServerError }
    );
  } finally {
    prisma.$disconnect();
  }
}

const handleProcess = (csvData: any[]) => {
  const obj: any = {};
  csvData.forEach(item => {
    const option = {
      id: item.optionId,
      questionId: item.id,
      content: item.optionContent,
      isCorrect: item.optionCorrect === 'true',
      order: Number(item.optionOrder || 0)
    }

    if (obj[item.id] !== undefined) {
      obj[item.id].quesOptions.push(option)
      return
    }

    obj[item.id] = {
      ...item,
      quesOptions: [ option ]
    }
  })
  return Object.values(obj)
}