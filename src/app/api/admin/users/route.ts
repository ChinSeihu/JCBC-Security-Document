import axios, { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from '../../auth/[...nextauth]/route';

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

    // 3. 获取 Keycloak 管理员访问令牌
    const adminToken = await getKeycloakAdminToken();
    
    // 4. 调用 Keycloak Admin API 获取用户列表
    const users = await fetchKeycloakUsers(adminToken);
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

// 获取 Keycloak 管理员访问令牌
async function getKeycloakAdminToken() {
  const response = await axios.post(
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
    new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_KEYCLOAK_SECRET_KEY as string,
      grant_type: 'client_credentials',
    })
  );
  return response.data.access_token;
}

// 调用 Keycloak Admin API 获取用户列表
async function fetchKeycloakUsers(adminToken: any) {
  const response = await axios.get(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      params: {
        max: 100, // 分页参数
      },
    }
  );
  return response.data;
}

// 验证用户是否为管理员（示例）
async function verifyAdminRole(userToken: any) {
  const userInfo = JSON.parse(atob(userToken.split('.')[1]))
  return userInfo?.realm_access?.roles?.includes('admin');
}