import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { historyList } from './server';
import { currentUser } from '@clerk/nextjs/server';
import { getSearchParams } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = getSearchParams(searchParams) || {};

    const user = await currentUser();
    if (!user?.id) throw new Error('userId is not defined...')
                
    
    const response = await historyList({ ...params, userId: user.id })

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