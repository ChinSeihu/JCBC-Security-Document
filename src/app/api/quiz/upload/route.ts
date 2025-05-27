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

    const documentIdSet = new Set(csvDatas.map((it: any) => it.documentId))
    // 4. 检查关联 document 是否存在
    const quizExists = await prisma.document.findMany({
      where: { 
        id: {
          in: Array.from(documentIdSet) as string[]
        },
        delFlag: false 
      },
      select: { id: true }
    })

    if (quizExists.length !== documentIdSet.size) {
      return NextResponse.json(
        { 
          status: HttpStatusCode.NotFound,
          message: '存在しないドキュメントIDがあります'
        })
    }

    await prisma.$transaction(async (runPrisma: ClientPrisma) => {
      try {
        const user = await validateUser(request);
        
        const processData: any = handleProcess(csvDatas);
        console.log(processData, '<<<<<<<<<<<<<processData')
        
        // 5. 创建问题
        const question = await upsertQuestionMany({
          questions: processData,
          runPrisma,
          userId: user.id as string
        })
        if (!question) return;
        await upsertQuesOptionsMany({ runPrisma, processData })
        
      } catch (e) {
        throw e
      }
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
      { error: error || 'Internal Server Error' }, 
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