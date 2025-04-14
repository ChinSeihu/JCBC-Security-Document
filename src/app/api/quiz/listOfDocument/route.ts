import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { listQuestionAndAwser } from './server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ data:{ message: 'ドキュメントが存在しないので、ご確認ください。' }}, { status: HttpStatusCode.NotFound })
    }

    const response = await listQuestionAndAwser({ documentId })

    return NextResponse.json({
      status: HttpStatusCode.Ok,
      data: response,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: HttpStatusCode.InternalServerError }
    );
  }
}