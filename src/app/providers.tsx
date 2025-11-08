'use client';

import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // MetaMaskエラーの場合はリトライしない
        if (error?.message?.includes('User rejected') || 
            error?.message?.includes('user rejected')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'JPYC Payment Scanner',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your_project_id_here',
  chains: [sepolia],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={sepolia}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}