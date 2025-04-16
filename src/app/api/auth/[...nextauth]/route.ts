import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers/index";
import KeycloakProvider from "next-auth/providers/keycloak";

const KEYCLOAK_ISSUER = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`;

const keycloakConfig = {
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_SECRET_KEY!,
  issuer: KEYCLOAK_ISSUER,
} as const;

const providers: Provider[] = [
  // Configure Keycloak as the authentication provider
  KeycloakProvider(keycloakConfig),
];
console.log(keycloakConfig, 'keycloakConfig')
const authOptions: NextAuthOptions = { providers };

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    // 1. 从 Keycloak 返回的 JWT 中提取角色
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        // 提取角色（根据 Keycloak 配置的声明名称）
        const tokenInfo = JSON.parse(atob(account.access_token.split('.')[1]))
        token.roles = tokenInfo?.realm_access?.roles || [];
        token.user = profile
      }
      return token;
    },
    // 2. 将角色注入 Session
    async session({ session, token }) {
      return Object.assign(session, {
        accessToken: token.accessToken,
        roles: token.roles,
        user: token.user
      });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };