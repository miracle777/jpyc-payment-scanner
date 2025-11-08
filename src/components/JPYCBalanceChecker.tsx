'use client';

import { useState } from 'react';
import { useReadContract, useAccount, useBalance } from 'wagmi';
import { JPYC_CONFIG, JPYC_COMMUNITY_CONFIG, formatJPYCDisplay } from '@/contracts/jpyc';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { isAddress, getAddress, formatEther } from 'viem';

export function JPYCBalanceChecker() {
  const { address: connectedAddress } = useAccount();
  const [inputAddress, setInputAddress] = useState('');
  const [checkAddress, setCheckAddress] = useState<string | null>(null);

  // 公式JPYC残高
  const {
    data: officialBalance,
    isError: officialBalanceError,
    isLoading: officialBalanceLoading,
    error: officialErrorDetail,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'balanceOf',
    args: checkAddress ? [checkAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!checkAddress && isAddress(checkAddress),
    },
  });

  const {
    data: officialDecimals,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'decimals',
  });

  // コミュニティJPYC残高
  const {
    data: communityBalance,
    isError: communityBalanceError,
    isLoading: communityBalanceLoading,
    error: communityErrorDetail,
  } = useReadContract({
    address: JPYC_COMMUNITY_CONFIG.address,
    abi: JPYC_COMMUNITY_CONFIG.abi,
    functionName: 'balanceOf',
    args: checkAddress ? [checkAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!checkAddress && isAddress(checkAddress),
    },
  });

  const {
    data: communityDecimals,
  } = useReadContract({
    address: JPYC_COMMUNITY_CONFIG.address,
    abi: JPYC_COMMUNITY_CONFIG.abi,
    functionName: 'decimals',
  });

  // ETH残高取得
  const {
    data: ethBalance,
    isError: ethBalanceError,
    isLoading: ethBalanceLoading,
  } = useBalance({
    address: checkAddress ? checkAddress as `0x${string}` : undefined,
    query: {
      enabled: !!checkAddress && isAddress(checkAddress),
    },
  });

  const handleCheck = () => {
    if (inputAddress && isAddress(inputAddress)) {
      // アドレスを正しいチェックサム形式に変換
      setCheckAddress(getAddress(inputAddress));
    }
  };

  const handleReset = () => {
    setInputAddress('');
    setCheckAddress(null);
  };

  // 残高データの計算
  const officialBalanceValue = officialBalance as bigint | undefined;
  const officialDecimalsValue = officialDecimals as number | undefined;
  const communityBalanceValue = communityBalance as bigint | undefined;
  const communityDecimalsValue = communityDecimals as number | undefined;

  const formattedOfficialBalance = officialBalanceValue && officialDecimalsValue
    ? formatJPYCDisplay(officialBalanceValue, officialDecimalsValue)
    : '0';

  const formattedCommunityBalance = communityBalanceValue && communityDecimalsValue
    ? formatJPYCDisplay(communityBalanceValue, communityDecimalsValue)
    : '0';

  const isLoading = officialBalanceLoading || communityBalanceLoading || ethBalanceLoading;
  const hasError = officialBalanceError || communityBalanceError;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-gray-600" />
        <h4 className="font-medium text-gray-800">任意アドレスの残高確認</h4>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder={connectedAddress ? "接続中のアドレスまたは他のアドレスを入力" : "ウォレットアドレスを入力してください"}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
        />
        
        {/* 接続中のウォレットアドレスを使用するボタン */}
        {connectedAddress && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded p-2">
            <div className="text-xs text-blue-700">
              <span className="font-medium">接続中:</span>
              <div className="font-mono mt-1 break-all">
                {connectedAddress.slice(0, 8)}...{connectedAddress.slice(-8)}
              </div>
            </div>
            <button
              onClick={() => setInputAddress(connectedAddress)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors flex-shrink-0"
            >
              使用
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleCheck}
            disabled={!inputAddress || !isAddress(inputAddress) || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isLoading ? '確認中...' : '残高確認'}
          </button>
          {checkAddress && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {inputAddress && !isAddress(inputAddress) && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>有効なアドレスではありません</span>
        </div>
      )}

      {/* Result Display */}
      {checkAddress && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <strong>確認アドレス:</strong>
          </div>
          <div className="text-xs font-mono bg-white p-2 rounded border break-all overflow-hidden">
            {checkAddress}
          </div>

          {/* ETH残高 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">⚡ ETH 残高（ガス代）</span>
            </div>
            {ethBalanceError ? (
              <div className="text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                取得エラー
              </div>
            ) : (
              <>
                <p className="text-xl font-bold text-yellow-900">
                  {ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(6) : '0'} ETH
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  決済時のガス代として使用されます
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${
                    ethBalance && parseFloat(formatEther(ethBalance.value)) > 0.001 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-yellow-600">
                    {ethBalance && parseFloat(formatEther(ethBalance.value)) > 0.001 
                      ? '残高十分（決済可能）' 
                      : '残高不足（Faucetから取得推奨）'
                    }
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 公式JPYC残高 */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">🏛️ 公式 JPYC 残高</span>
            </div>
            {officialBalanceError ? (
              <div className="text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                取得エラー
                {officialErrorDetail && (
                  <p className="text-xs mt-1 font-mono">{officialErrorDetail.message}</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-xl font-bold text-blue-900">
                  {formattedOfficialBalance} JPYC
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  生データ: {officialBalanceValue?.toString() || '0'}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  コントラクト: {JPYC_CONFIG.address.slice(0, 6)}...{JPYC_CONFIG.address.slice(-4)}
                </p>
              </>
            )}
          </div>

          {/* コミュニティJPYC残高 */}
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">🌍 コミュニティ JPYC 残高</span>
            </div>
            {communityBalanceError ? (
              <div className="text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                取得エラー
                {communityErrorDetail && (
                  <p className="text-xs mt-1 font-mono">{communityErrorDetail.message}</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-xl font-bold text-green-900">
                  {formattedCommunityBalance} JPYC
                </p>
                <p className="text-xs text-green-600 mt-1">
                  生データ: {communityBalanceValue?.toString() || '0'}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  コントラクト: {JPYC_COMMUNITY_CONFIG.address.slice(0, 6)}...{JPYC_COMMUNITY_CONFIG.address.slice(-4)}
                </p>
              </>
            )}
          </div>

          {/* 合計表示 */}
          {!hasError && (
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">📊 合計残高</span>
              </div>
              <p className="text-xl font-bold text-purple-900">
                {(Number(formattedOfficialBalance.replace(/,/g, '')) + Number(formattedCommunityBalance.replace(/,/g, ''))).toLocaleString('ja-JP')} JPYC
              </p>
              <p className="text-xs text-purple-600 mt-1">
                公式: {formattedOfficialBalance} + コミュニティ: {formattedCommunityBalance}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 接続中のウォレットアドレスの簡単入力 */}
      {connectedAddress && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => setInputAddress(connectedAddress)}
            className="w-full text-left text-xs bg-blue-50 border border-blue-200 rounded p-2 hover:bg-blue-100 transition-colors"
          >
            <span className="text-blue-600 font-medium">接続中のウォレットアドレスを使用</span>
            <div className="text-gray-600 font-mono mt-1 break-all">
              {connectedAddress.slice(0, 8)}...{connectedAddress.slice(-8)}
            </div>
          </button>
        </div>
      )}
        
      {/* 詳細デバッグ情報 */}
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs font-medium text-blue-800 mb-1">🔍 複数コントラクト対応:</p>
        <div className="space-y-1 text-xs text-blue-700">
          <p className="break-all">• 🏛️ 公式JPYC: {JPYC_CONFIG.address.slice(0, 10)}...{JPYC_CONFIG.address.slice(-10)}</p>
          <p className="break-all">• 🌍 コミュニティJPYC: {JPYC_COMMUNITY_CONFIG.address.slice(0, 10)}...{JPYC_COMMUNITY_CONFIG.address.slice(-10)}</p>
          <p>• ⚡ ETH残高も同時に表示（ガス代確認用）</p>
          <p>• 各コントラクトの残高を個別に表示</p>
          <p>• 合計残高も自動計算して表示</p>
        </div>
      </div>
    </div>
  );
}