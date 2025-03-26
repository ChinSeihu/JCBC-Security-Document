import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';
import { listDocuments } from './server';

export async function GET(request: Request) {
  try {
    console.log(request.body)

    const response = await listDocuments({})

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