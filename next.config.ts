import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Turbopack設定（空でも明示的に設定）
  turbopack: {},
  
  // 最適化設定
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  },
  
  // HTTPS対応とスマホアクセス用設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self)',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          // PWA用のヘッダー
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // コンパイラー設定
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

// PWA設定
const pwaConfig = withPWA({
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    sw: 'sw.js',
    publicExcludes: ['!noprecache/**/*'],
    buildExcludes: [/middleware-manifest.json$/],
    // iOS最適化
    mode: 'production',
    fallbacks: {
      image: '/icons/icon-512x512.png',
      document: '/_offline',
    },
    cacheStartUrl: true,
    dynamicStartUrl: false,
    reloadOnOnline: true,
    // カメラアクセス対応
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60, // 24時間
          },
        },
      },
    ],
  },
})(nextConfig);

export default pwaConfig;
