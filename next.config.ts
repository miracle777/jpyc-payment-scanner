import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // 最適化設定
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  },
  
  // クロスオリジン設定（スマホアクセス用）
  allowedDevOrigins: ['172.20.10.11'],
  
  // コンパイラー設定
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
