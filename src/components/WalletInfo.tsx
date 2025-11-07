'use client';

import { motion } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface WalletInfoProps {
  detailed?: boolean;
}

export function WalletInfo({ detailed = false }: WalletInfoProps) {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          ウォレット情報
        </h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            アドレス
          </label>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
              {`${address.slice(0, 8)}...${address.slice(-6)}`}
            </p>
            <button
              onClick={copyAddress}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="アドレスをコピー"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {detailed && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                ネットワーク
              </label>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {chain?.name || 'Unknown'}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                ETH残高
              </label>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : '読み込み中...'}
              </p>
            </div>

            <div className="pt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                完全なアドレス:
              </div>
              <div className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1">
                {address}
              </div>
            </div>
          </>
        )}

        {!detailed && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ネットワーク: {chain?.name || 'Unknown'}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
}