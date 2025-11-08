declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    sw?: string;
    publicExcludes?: string[];
    buildExcludes?: RegExp[];
    mode?: string;
    fallbacks?: {
      image?: string;
      document?: string;
    };
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
    runtimeCaching?: Array<{
      urlPattern: RegExp;
      handler: string;
      options?: {
        cacheName: string;
        expiration?: {
          maxEntries: number;
          maxAgeSeconds: number;
        };
      };
    }>;
  }

  interface WithPWAConfig extends NextConfig {
    pwa: PWAConfig;
  }

  function withPWA(config: WithPWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}