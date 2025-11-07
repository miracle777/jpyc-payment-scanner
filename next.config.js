/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  },
  // 空のturbopack設定でエラーを回避
  turbopack: {},
};

module.exports = nextConfig;

module.exports = nextConfig;