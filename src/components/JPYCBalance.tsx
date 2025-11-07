'use client';

import { useAccount, useReadContract } from 'wagmi';
import { JPYC_CONFIG, JPYC_FAUCET_CONFIG, formatJPYCDisplay } from '@/contracts/jpyc';
import { Coins, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

export function JPYCBalance() {
  const { address, isConnected } = useAccount();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
    error: balanceErrorDetail,
    refetch,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000, // 30秒ごとに更新
    },
  });

  const {
    data: decimals,
    isError: decimalsError,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'decimals',
    query: {
      enabled: !!address && isConnected,
    },
  });

  const {
    data: symbol,
    isError: symbolError,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'symbol',
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Faucet用JPYCコントラクトでの残高確認
  const {
    data: faucetBalance,
    isError: faucetBalanceError,
    isLoading: faucetBalanceLoading,
    refetch: faucetRefetch,
  } = useReadContract({
    address: JPYC_FAUCET_CONFIG.address,
    abi: JPYC_FAUCET_CONFIG.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000,
    },
  });

  const {
    data: faucetDecimals,
  } = useReadContract({
    address: JPYC_FAUCET_CONFIG.address,
    abi: JPYC_FAUCET_CONFIG.abi,
    functionName: 'decimals',
    query: {
      enabled: !!address && isConnected,
    },
  });

  const {
    data: faucetSymbol,
  } = useReadContract({
    address: JPYC_FAUCET_CONFIG.address,
    abi: JPYC_FAUCET_CONFIG.abi,
    functionName: 'symbol',
    query: {
      enabled: !!address && isConnected,
    },
  });

  // デバッグ用のコンソールログ
  useEffect(() => {
    const debugInfo = {
      address,
      isConnected,
      contractAddress: JPYC_CONFIG.address,
      balance: balance?.toString(),
      decimals,
      symbol,
      balanceError,
      decimalsError,
      symbolError,
      // Faucet contract info
      faucetContractAddress: JPYC_FAUCET_CONFIG.address,
      faucetBalance: faucetBalance?.toString(),
      faucetDecimals,
      faucetSymbol,
      faucetBalanceError,
    };
    console.log('🔍 JPYC Balance Debug:', debugInfo);
    console.log('📊 Raw Balance (bigint):', balance);
    console.log('🚰 Faucet Balance (bigint):', faucetBalance);
    console.log('🔢 Decimals:', decimals);
    console.log('🏷️ Symbol:', symbol);
    console.log('❌ Errors:', { balanceError, decimalsError, symbolError });
  }, [address, isConnected, balance, decimals, symbol, balanceError, decimalsError, symbolError, faucetBalance, faucetDecimals, faucetSymbol, faucetBalanceError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), faucetRefetch()]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Coins className="h-5 w-5" />
          <span className="font-medium">JPYC残高</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          ウォレットに接続してください
        </p>
      </div>
    );
  }

  const hasError = balanceError || decimalsError || symbolError;

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">残高取得エラー</span>
        </div>
        <p className="text-sm text-red-600 mt-1">
          JPYC残高の取得に失敗しました
        </p>
        {showDebug && balanceErrorDetail && (
          <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 max-h-32 overflow-y-auto">
            <p className="font-semibold mb-1">エラー詳細:</p>
            <p>{balanceErrorDetail.message}</p>
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleRefresh}
            className="text-sm text-red-700 underline hover:text-red-800"
          >
            再試行
          </button>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-red-700 underline hover:text-red-800"
          >
            {showDebug ? 'デバッグ非表示' : 'デバッグ表示'}
          </button>
        </div>
      </div>
    );
  }

  const balanceValue = balance as bigint | undefined;
  const decimalsValue = decimals as number | undefined;
  const symbolValue = symbol as string | undefined;

  const faucetBalanceValue = faucetBalance as bigint | undefined;
  const faucetDecimalsValue = faucetDecimals as number | undefined;
  const faucetSymbolValue = faucetSymbol as string | undefined;

  const formattedBalance = balanceValue && decimalsValue
    ? formatJPYCDisplay(balanceValue, decimalsValue)
    : '0';

  const formattedFaucetBalance = faucetBalanceValue && faucetDecimalsValue
    ? formatJPYCDisplay(faucetBalanceValue, faucetDecimalsValue)
    : '0';

  const displaySymbol = symbolValue || faucetSymbolValue || 'JPYC';
  
  // どちらかに残高がある場合は表示
  const hasBalance = (faucetBalanceValue && faucetBalanceValue > 0n) || (balanceValue && balanceValue > 0n);
  const mainBalance = faucetBalanceValue && faucetBalanceValue > 0n ? formattedFaucetBalance : formattedBalance;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-800">
          <Coins className="h-5 w-5" />
          <span className="font-medium">JPYC残高</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="デバッグ情報を表示"
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={balanceLoading || isRefreshing}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw 
              className={`h-4 w-4 ${(balanceLoading || isRefreshing) ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        {balanceLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">残高を確認中...</span>
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-blue-900">
              {mainBalance} {displaySymbol}
            </p>
            {faucetBalanceValue && faucetBalanceValue > 0n && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Faucet残高: {formattedFaucetBalance} {displaySymbol}
              </p>
            )}
            {formattedBalance !== '0' && formattedFaucetBalance === '0' && (
              <p className="text-xs text-blue-600 mt-1">
                📜 公式残高: {formattedBalance} {displaySymbol}
              </p>
            )}
            <p className="text-xs text-blue-600 mt-1">
              Sepolia testnet • 30秒ごと自動更新
            </p>
          </>
        )}
      </div>

      {/* Debug Information */}
      {showDebug && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs font-medium text-blue-800 mb-2">🔍 デバッグ情報:</p>
          <div className="space-y-1 text-xs font-mono">
            <div className="bg-blue-100 p-2 rounded">
              <p className="text-blue-800"><strong>ウォレット:</strong> {address}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <p className="text-blue-800"><strong>公式コントラクト:</strong> {JPYC_CONFIG.address}</p>
              <p className="text-blue-800"><strong>公式残高:</strong> {balanceValue?.toString() || 'null'}</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <p className="text-green-800"><strong>Faucetコントラクト:</strong> {JPYC_FAUCET_CONFIG.address}</p>
              <p className="text-green-800"><strong>Faucet残高:</strong> {faucetBalanceValue?.toString() || 'null'}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <p className="text-blue-800"><strong>Decimals:</strong> {decimalsValue || 'null'} / {faucetDecimalsValue || 'null'}</p>
              <p className="text-blue-800"><strong>Symbol:</strong> {symbolValue || 'null'} / {faucetSymbolValue || 'null'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Address Display */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs font-medium text-blue-800 mb-1">
          コントラクトアドレス:
        </p>
        <p className="text-xs font-mono text-blue-700 break-all">
          {JPYC_CONFIG.address}
        </p>
        
        {/* 残高が0の場合のヘルプ */}
        {formattedBalance === '0' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs font-medium text-yellow-800 mb-2">💡 残高が0の場合:</p>
            <div className="space-y-2 text-xs text-yellow-700">
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>テスト用JPYCを取得していない</p>
                  <p className="text-yellow-600">→ JPYC公式のテストネット配布を確認</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>別のアドレスで受け取った</p>
                  <p className="text-yellow-600">→ ウォレットタブで任意アドレスを確認</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>Sepoliaネットワークではない</p>
                  <p className="text-yellow-600">→ MetaMaskでネットワークを確認</p>
                </div>
              </div>
            </div>
            <a
              href={`https://sepolia.etherscan.io/token/${JPYC_CONFIG.address}?a=${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-yellow-800 underline hover:text-yellow-900"
            >
              Etherscanで確認 →
            </a>
          </div>
        )}
        
        <p className="text-xs text-blue-600 mt-1">
          ⚠️ これはテスト用JPYCです（価値はありません）
        </p>
      </div>
    </div>
  );
}