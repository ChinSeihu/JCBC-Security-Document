/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
  compiler: {
    styledComponents: true,
  }
};

export default nextConfig;
