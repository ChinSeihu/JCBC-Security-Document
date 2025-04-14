import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { getUserList } from '@/lib';

export async function GET(req: NextRequest) {
  // 1. 验证请求权限（仅允许管理员）
  const authorization = req.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({
      status: HttpStatusCode.Unauthorized,
    });
  }

  const token = authorization.split(' ')[1];
  try {
    // 2. 验证用户角色（需自行实现）
    const hasAdminRole = await verifyAdminRole(token);
    if (!hasAdminRole) {
      return NextResponse.json({
        status: HttpStatusCode.Forbidden,
      });
    }
    // 4. 调用 Keycloak Admin API 获取用户列表
    const users = await getUserList();
    return NextResponse.json({
        status: HttpStatusCode.Ok,
        data: users,
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

// 验证用户是否为管理员（示例）
async function verifyAdminRole(userToken: any) {
  const userInfo = JSON.parse(atob(userToken.split('.')[1]))
  return userInfo?.realm_access?.roles?.includes('admin');
}