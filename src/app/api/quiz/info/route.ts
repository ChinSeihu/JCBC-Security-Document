import { NextRequest, NextResponse } from 'next/server'
// import { validateAdmin } from '@/lib/auth'
import { HttpStatusCode } from 'axios'
import { getQuestionInfo } from './server'
import { getSearchParams } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const  { questionId } = getSearchParams(searchParams);
    console.log(questionId)
    // 3. 数据校验
    if (!questionId) {
      return NextResponse.json(
        { data: { message: 'パラメーター不備' }},
        { status: HttpStatusCode.BadRequest }
      )
    }

    const response = await getQuestionInfo(questionId)

    return NextResponse.json({
      data: {
        success: true,
        ...response
      },
      status: HttpStatusCode.Ok
  })
  } catch (error) {
    console.error('[GET_QUESTION_ERROR]', error)
    return NextResponse.json(
      { data: { message: 'システムエラー'} },
      { status: HttpStatusCode.InternalServerError }
    )
  }
}