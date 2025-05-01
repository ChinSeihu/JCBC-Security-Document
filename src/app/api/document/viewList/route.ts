import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { listFromTestStatus } from './server';
import { validateUser } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const user = await validateUser(request);

    const response = await listFromTestStatus(user.id)

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