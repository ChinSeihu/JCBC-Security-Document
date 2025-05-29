// app/api/read-pdf/route.js (App Router)
import { NextRequest, NextResponse } from 'next/server';
import { getPublicList } from './server';
import { HttpStatusCode } from 'axios';
import { getSearchParams } from '@/lib';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { documentId } = getSearchParams(searchParams);

    const publicList = await getPublicList(documentId);

    return NextResponse.json({
      data: { data: publicList, success: true },
      status: HttpStatusCode.Ok
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}