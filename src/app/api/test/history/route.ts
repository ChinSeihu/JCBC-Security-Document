import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { historyList } from './server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page') || 1);
    const pageSize = Number(searchParams.get('pageSize') || 10);

    const user = await currentUser();
    if (!user?.id) throw new Error('userId is not defined...')
                
    
    const response = await historyList({ page, pageSize, userId: user.id })

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