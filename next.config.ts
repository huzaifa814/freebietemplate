import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
