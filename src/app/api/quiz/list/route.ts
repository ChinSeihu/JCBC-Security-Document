import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';
import { listQuestion } from './server';

export async function GET(request: Request) {
  try {
    console.log(request.body)

    const response = await listQuestion({})

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