'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { JPYC_CONFIG, formatJPYCDisplay } from '@/contracts/jpyc';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { isAddress, getAddress } from 'viem';

export function JPYCBalanceChecker() {
  const [inputAddress, setInputAddress] = useState('');
  const [checkAddress, setCheckAddress] = useState<string | null>(null);

  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
    error: errorDetail,
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
    data: decimals,
  } = useReadContract({
    address: JPYC_CONFIG.address,
    abi: JPYC_CONFIG.abi,
    functionName: 'decimals',
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

  const balanceValue = balance as bigint | undefined;
  const decimalsValue = decimals as number | undefined;

  const formattedBalance = balanceValue && decimalsValue
    ? formatJPYCDisplay(balanceValue, decimalsValue)
    : '0';

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
          placeholder="0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleCheck}
            disabled={!inputAddress || !isAddress(inputAddress) || balanceLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {balanceLoading ? '確認中...' : '残高確認'}
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
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>確認アドレス:</strong>
          </div>
          <div className="text-xs font-mono bg-white p-2 rounded border break-all">
            {checkAddress}
          </div>

          {balanceError ? (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">エラーが発生しました</span>
              </div>
              {errorDetail && (
                <p className="text-xs text-red-600 mt-1 font-mono">
                  {errorDetail.message}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">JPYC残高</span>
              </div>
              <p className="text-xl font-bold text-green-900">
                {formattedBalance} JPYC
              </p>
              <p className="text-xs text-green-600 mt-1">
                生データ: {balanceValue?.toString() || '0'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sample Addresses */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">サンプルアドレス:</p>
        <div className="space-y-1">
          <button
            onClick={() => setInputAddress('0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd')}
            className="w-full text-left text-xs font-mono bg-white border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors"
          >
            0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd
          </button>
        </div>
        
        {/* 詳細デバッグ情報 */}
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs font-medium text-blue-800 mb-1">🔍 トラブルシューティング:</p>
          <div className="space-y-1 text-xs text-blue-700">
            <p>• アドレスのチェックサム（大文字小文字）を自動修正</p>
            <p>• 現在使用中のコントラクト: 0x3eF95...522253</p>
            <p>• Faucetページで表示されたアドレスを使用中</p>
          </div>
        </div>
      </div>
    </div>
  );
}