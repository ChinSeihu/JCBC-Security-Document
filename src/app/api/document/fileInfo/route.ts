// app/api/read-pdf/route.js (App Router)
import { NextRequest, NextResponse } from 'next/server';
import { getPublicFileInfo, getUserTestStatus } from './server';
import { HttpStatusCode } from 'axios';
import { validateUser } from '@/lib';

export async function GET(request: NextRequest) {
  try {
    const fileInfo = await getPublicFileInfo();
		const user = await validateUser(request);
    
    if (!fileInfo) {
      return NextResponse.json(
        { 
          data: null, 
          message: '公開されているファイルを見つけません',
          status: HttpStatusCode.NotFound 
        }
      );
    }

    const testStatus = await getUserTestStatus(fileInfo, user.id);

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