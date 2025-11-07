'use client';

import { useAccount, useReadContract } from 'wagmi';
import { JPYC_CONFIG, JPYC_COMMUNITY_CONFIG, formatJPYCDisplay } from '@/contracts/jpyc';
import { Coins, AlertCircle, RefreshCw, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface JPYCBalanceProps {
  selectedContract?: 'official' | 'community';
  onContractChange?: (contract: 'official' | 'community') => void;
}

export function JPYCBalance({ selectedContract: externalSelectedContract, onContractChange }: JPYCBalanceProps = {}) {
  const { address, isConnected } = useAccount();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [internalSelectedContract, setInternalSelectedContract] = useState<'official' | 'community'>('official');
  
  // 外部からの制御がある場合は外部の状態を使用、そうでなければ内部の状態を使用
  const selectedContract = externalSelectedContract ?? internalSelectedContract;
  const setSelectedContract = (value: 'official' | 'community') => {
    if (onContractChange) {
      onContractChange(value);
    } else {
      setInternalSelectedContract(value);
    }
  };

  // 公式JPYC残高取得
  const {
    data: officialBalance,
    isError: officialBalanceError,
    isLoading: officialBalanceLoading,
    error: officialBalanceErrorDetail,
    refetch: officialRefetch,
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
    data: officialDecimals,
    isError: officialDecimalsError,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'decimals',
    query: {
      enabled: !!address && isConnected,
    },
  });

  const {
    data: officialSymbol,
    isError: officialSymbolError,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'symbol',
    query: {
      enabled: !!address && isConnected,
    },
  });

  // コミュニティJPYC残高取得
  const {
    data: communityBalance,
    isError: communityBalanceError,
    isLoading: communityBalanceLoading,
    refetch: communityRefetch,
  } = useReadContract({
    address: JPYC_COMMUNITY_CONFIG.address,
    abi: JPYC_COMMUNITY_CONFIG.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000,
    },
  });

  const {
    data: communityDecimals,
  } = useReadContract({
    address: JPYC_COMMUNITY_CONFIG.address,
    abi: JPYC_COMMUNITY_CONFIG.abi,
    functionName: 'decimals',
    query: {
      enabled: !!address && isConnected,
    },
  });

  const {
    data: communitySymbol,
  } = useReadContract({
    address: JPYC_COMMUNITY_CONFIG.address,
    abi: JPYC_COMMUNITY_CONFIG.abi,
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
      // 公式契約情報
      officialContractAddress: JPYC_CONFIG.address,
      officialBalance: officialBalance?.toString(),
      officialDecimals,
      officialSymbol,
      officialBalanceError,
      officialDecimalsError,
      officialSymbolError,
      // コミュニティ契約情報
      communityContractAddress: JPYC_COMMUNITY_CONFIG.address,
      communityBalance: communityBalance?.toString(),
      communityDecimals,
      communitySymbol,
      communityBalanceError,
    };
    console.log('🔍 JPYC Balance Debug:', debugInfo);
    console.log('📊 公式残高 (bigint):', officialBalance);
    console.log('🌍 コミュニティ残高 (bigint):', communityBalance);
    console.log('🔢 Decimals:', officialDecimals);
    console.log('🏷️ Symbol:', officialSymbol);
    console.log('❌ Errors:', { officialBalanceError, officialDecimalsError, officialSymbolError });
  }, [address, isConnected, officialBalance, officialDecimals, officialSymbol, officialBalanceError, officialDecimalsError, officialSymbolError, communityBalance, communityDecimals, communitySymbol, communityBalanceError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([officialRefetch(), communityRefetch()]);
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

  const hasError = officialBalanceError || officialDecimalsError || officialSymbolError;

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
        {showDebug && officialBalanceErrorDetail && (
          <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 max-h-32 overflow-y-auto">
            <p className="font-semibold mb-1">エラー詳細:</p>
            <p>{officialBalanceErrorDetail.message}</p>
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

  const officialBalanceValue = officialBalance as bigint | undefined;
  const officialDecimalsValue = officialDecimals as number | undefined;
  const officialSymbolValue = officialSymbol as string | undefined;

  const communityBalanceValue = communityBalance as bigint | undefined;
  const communityDecimalsValue = communityDecimals as number | undefined;
  const communitySymbolValue = communitySymbol as string | undefined;

  const formattedOfficialBalance = officialBalanceValue && officialDecimalsValue
    ? formatJPYCDisplay(officialBalanceValue, officialDecimalsValue)
    : '0';

  const formattedCommunityBalance = communityBalanceValue && communityDecimalsValue
    ? formatJPYCDisplay(communityBalanceValue, communityDecimalsValue)
    : '0';

  const displaySymbol = officialSymbolValue || communitySymbolValue || 'JPYC';
  
  // 選択されたコントラクトの残高を表示
  const isOfficialContract = selectedContract === 'official';
  const currentBalance = isOfficialContract ? formattedOfficialBalance : formattedCommunityBalance;
  const currentContractAddress = isOfficialContract ? JPYC_CONFIG.address : JPYC_COMMUNITY_CONFIG.address;

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
            disabled={(officialBalanceLoading || communityBalanceLoading) || isRefreshing}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw 
              className={`h-4 w-4 ${((officialBalanceLoading || communityBalanceLoading) || isRefreshing) ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>

      {/* コントラクト選択 */}
      <div className="mt-3 flex gap-1">
        <button
          onClick={() => setSelectedContract('official')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            selectedContract === 'official'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          公式 JPYC ({formattedOfficialBalance})
        </button>
        <button
          onClick={() => setSelectedContract('community')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            selectedContract === 'community'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          コミュニティ JPYC ({formattedCommunityBalance})
        </button>
      </div>
      
      <div className="mt-3">
        {(officialBalanceLoading || communityBalanceLoading) ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">残高を確認中...</span>
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-blue-900">
              {currentBalance} {displaySymbol}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {isOfficialContract ? '🏛️ 公式コントラクト' : '🌍 コミュニティコントラクト'} • Sepolia testnet • 30秒ごと自動更新
            </p>
          </>
        )}
      </div>

      {/* JPYC Faucetサイトリンク */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-blue-800">
            � テスト用JPYC取得方法:
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <a
              href="https://faucet.jpyc.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
            >
              公式 JPYC Faucet
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.jpyc.cool/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
            >
              コミュニティ Faucet
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-gray-600">
            💡 Faucetが機能しない場合は、X(旧Twitter)でJPYC関連の最新情報をご確認ください
          </p>
        </div>
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
              <p className="text-blue-800"><strong>公式残高:</strong> {officialBalanceValue?.toString() || 'null'}</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <p className="text-green-800"><strong>コミュニティコントラクト:</strong> {JPYC_COMMUNITY_CONFIG.address}</p>
              <p className="text-green-800"><strong>コミュニティ残高:</strong> {communityBalanceValue?.toString() || 'null'}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <p className="text-blue-800"><strong>Decimals:</strong> {officialDecimalsValue || 'null'} / {communityDecimalsValue || 'null'}</p>
              <p className="text-blue-800"><strong>Symbol:</strong> {officialSymbolValue || 'null'} / {communitySymbolValue || 'null'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Address Display */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs font-medium text-blue-800 mb-1">
          選択中のコントラクト:
        </p>
        <p className="text-xs font-mono text-blue-700 break-all">
          {currentContractAddress}
        </p>
        
        {/* 残高が0の場合のヘルプ */}
        {currentBalance === '0' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs font-medium text-yellow-800 mb-2">💡 残高が表示されない場合:</p>
            <div className="space-y-2 text-xs text-yellow-700">
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>テスト用JPYCを取得していない</p>
                  <p className="text-yellow-600">→ 下のFaucetリンクからJPYCを取得してください</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>別のコントラクトに残高がある</p>
                  <p className="text-yellow-600">→ 上の「公式 JPYC」「コミュニティ JPYC」ボタンで切り替え</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>ネットワーク設定を確認</p>
                  <p className="text-yellow-600">→ MetaMaskでSepoliaテストネットに接続</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>JPYCの最新情報を確認したい場合</p>
                  <p className="text-yellow-600">→ X(旧Twitter)でJPYCの関連アカウントを検索</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span>•</span>
                <div>
                  <p>表示について</p>
                  <p className="text-yellow-600">→ JPYCは1JPYC=1円として整数表示（例: 2,500 JPYC）</p>
                </div>
              </div>
            </div>
            <a
              href={`https://sepolia.etherscan.io/token/${currentContractAddress}?a=${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-yellow-800 underline hover:text-yellow-900"
            >
              Etherscanで確認 →
            </a>
          </div>
        )}
        
        <p className="text-xs text-blue-600 mt-2">
          ⚠️ これはテスト用JPYCです（価値はありません）
        </p>
      </div>
    </div>
  );
}
