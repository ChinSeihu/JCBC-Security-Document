import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { resultList } from './server';
import { getSearchParams } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = getSearchParams(searchParams);
    
    const response = await resultList(params)

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