import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { createTestStatus, documentStatusUpdate } from './server';
import { validateUser } from '@/lib';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()
    const user = await validateUser(request);
    
    const { id, isPublic } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    await prisma.$transaction(async clientPrisma => {
      await documentStatusUpdate({ id, isPublic, userId: user.id, prisma: clientPrisma })
      if (isPublic) await createTestStatus({ documentId: id, prisma: clientPrisma })
    })
    return NextResponse.json({
      status: HttpStatusCode.Ok,
      data: {
        success: true,
        message: '更新に成功しました！'
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: HttpStatusCode.InternalServerError }
    );
  } finally {
    await prisma.$disconnect()
  }
}
