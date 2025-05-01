/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  images: {
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
  compiler: {
    styledComponents: true,
  },
  env: {
    NEXT_PUBLIC_UPLOAD_DIR: process.env.NEXT_PUBLIC_UPLOAD_DIR,
    DATABASE_URL:  process.env.DATABASE_URL,
    KEYCLOAK_URL: process.env.KEYCLOAK_URL,
    KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
    KEYCLOAK_SECRET_KEY: process.env.KEYCLOAK_SECRET_KEY,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
  }
};

export default nextConfig;
