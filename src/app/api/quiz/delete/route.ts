// app/api/read-pdf/route.js (App Router)
import { NextResponse } from 'next/server';
import { handleOptionDelete, handleQuizDelete } from './server';
import { HttpStatusCode } from 'axios';
import prisma from '@/lib/prisma';
import { ClientPrisma } from '@/constants/type';

export async function POST(request: Request) {
  try {
    const params = await request.json()
    const { id } = params;

    prisma.$transaction(async (runPrisma: ClientPrisma) => {
      await handleQuizDelete(id, runPrisma)
      await handleOptionDelete(id, runPrisma)
    })
    // 返回 PDF 数据流
    return NextResponse.json({
      data: { success: true, message: '問題の削除に成功しました！' },
      status: HttpStatusCode.Ok
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatusCode.InternalServerError }
    );
  } finally {
    prisma.$disconnect();
  }
}