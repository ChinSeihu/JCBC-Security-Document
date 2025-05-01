import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getUserList } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const response = await getUserList()

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