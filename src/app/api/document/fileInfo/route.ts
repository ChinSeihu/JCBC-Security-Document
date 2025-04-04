// app/api/read-pdf/route.js (App Router)
import { NextResponse } from 'next/server';
import { getPublicFileInfo, getUserTestStatus } from './server';
import { HttpStatusCode } from 'axios';

export async function GET() {
  try {
    const fileInfo = await getPublicFileInfo();

    if (!fileInfo) {
      return NextResponse.json(
        { 
          data: null, 
          message: '公開されているファイルを見つけません',
          status: HttpStatusCode.NotFound 
        }
      );
    }

    const testStatus = await getUserTestStatus(fileInfo);

    return NextResponse.json({
      data: {...fileInfo, success: true, testStatus },
      status: HttpStatusCode.Ok
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}