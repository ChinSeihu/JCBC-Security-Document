import { Profile } from "next-auth";
import { useSession } from "next-auth/react";
import { axios, TSessionInfo } from "./fetch";
import { decode } from "next-auth/jwt";
import { NextRequest } from "next/server";

export const getSearchParams = (searchParams: URLSearchParams) => {
    const result: Record<string, any> = {};
    (searchParams?.entries() as any)?.forEach?.((it: string[]) => {
        const [key, value] = it;
        result[key] = value;
    })
    return result;
}

export const useSessionInfo = (): TSessionInfo => {
    const { data: session } = useSession({ required: true });
    return session as TSessionInfo
}

export const getUserList = async () => {
    // 3. 获取 Keycloak 管理员访问令牌
    const adminToken = await getKeycloakAdminToken();
    
    // 4. 调用 Keycloak Admin API 获取用户列表
    const users = await fetchKeycloakUsers(adminToken);
    return users
}

export const getCurrentuser = async (request: NextRequest): Promise<Profile | null> => {
  const token = await requestToken(request);
  return token?.user as Profile | null
}

export const validateUser = async (request: NextRequest) => {
    const user = await getCurrentuser(request);
    if (!user?.sub) throw new Error('userId is not defined...')
    return { ...user, id: user.sub }
}

// 获取 Keycloak 管理员访问令牌
export async function getKeycloakAdminToken() {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_SECRET_KEY!,
        grant_type: 'client_credentials',
      })
    );
    return response.data.access_token;
  }
  
// 调用 Keycloak Admin API 获取用户列表
export async function fetchKeycloakUsers(adminToken: any) {
  const response = await axios.get(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
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

export const requestToken = async (request: NextRequest) => {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").reduce((acc:any, cookie:any) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const encryptedToken = cookies["next-auth.session-token"];
  if (!encryptedToken) {
    throw new Error('next-auth is not defined');
  }

  // 解密 Token
  const token = await decode({
    token: encryptedToken,
    secret: process.env.NEXTAUTH_SECRET!,
  });
  return token
}  
