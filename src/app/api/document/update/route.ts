// app/api/read-pdf/route.js (App Router)
import { NextRequest, NextResponse } from 'next/server';
import { handleDocumentUpdate } from './server';
import { HttpStatusCode } from 'axios';
import { validateUser } from '@/lib';
import prisma from '@/lib/prisma';
import { ClientPrisma } from '@/constants/type';
import { createTestStatus } from '../statusUpdate/server';

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()
    const { comment, deadline, id, targetIds = [] } = params;
    const user = await validateUser(request);

    await prisma.$transaction(async (clientPrisma: ClientPrisma) => {
      await handleDocumentUpdate({
        clientPrisma, comment, deadline, id, userId: user.id
      });
      await createTestStatus({ documentId: id, prisma: clientPrisma, targetIds })
    })

    return NextResponse.json({
      status: HttpStatusCode.Ok,
      data: {
        success: true,
        message: 'ドキュメントの修正に成功しました'
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}