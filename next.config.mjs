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
    DATABASE_URL:  process.env.DATABASE_URL
  }
};

export default nextConfig;
