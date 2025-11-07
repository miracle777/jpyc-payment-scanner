'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Coins, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function JPYCTestHelper() {
  const { address, isConnected } = useAccount();
  const [showHelper, setShowHelper] = useState(false);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // シンプルなERC20 Faucetコントラクト（存在する場合）
  const handleRequestTestTokens = async () => {
    // 注意: 実際のfaucetコントラクトが必要
    // ここではサンプルコードとして記載
    console.log('🚰 テストトークンをリクエスト中...');
    // 実際の実装では適切なfaucetコントラクトを呼び出し
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800">
          <Coins className="h-5 w-5" />
          <span className="font-medium">テスト用JPYC取得</span>
        </div>
        <button
          onClick={() => setShowHelper(!showHelper)}
          className="text-sm text-amber-700 underline hover:text-amber-800"
        >
          {showHelper ? '非表示' : 'ヘルプ表示'}
        </button>
      </div>

      {showHelper && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-amber-800">
            <h4 className="font-medium mb-2">🔧 テスト用JPYC取得方法:</h4>
            
            <div className="space-y-3">
              {/* 公式方法 */}
              <div className="bg-white border border-amber-200 rounded p-3">
                <h5 className="font-medium text-amber-900 mb-2">1. 公式JPYCテストFaucet 🚰</h5>
                <p className="text-xs text-amber-700 mb-2">
                  JPYC公式が提供するテストネット用Faucet
                </p>
                <a
                  href="https://faucet.jpyc.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-800 underline hover:text-amber-900"
                >
                  JPYC Faucet <ExternalLink className="h-3 w-3" />
                </a>
                <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                  <p className="font-medium">💡 Faucetが届かない場合:</p>
                  <ul className="mt-1 space-y-1 ml-3">
                    <li>• トランザクションが失敗していないか確認</li>
                    <li>• ガス代（ETH）が不足していないか確認</li>
                    <li>• 24時間以内に既に受け取っていないか確認</li>
                    <li>• Sepoliaネットワークに接続されているか確認</li>
                  </ul>
                </div>
              </div>

              {/* コミュニティFaucet */}
              <div className="bg-white border border-amber-200 rounded p-3">
                <h5 className="font-medium text-amber-900 mb-2">2. コミュニティFaucet</h5>
                <p className="text-xs text-amber-700 mb-2">
                  JPYCコミュニティが提供するテストネット用Faucet
                </p>
                <a
                  href="https://www.jpyc.cool/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-800 underline hover:text-amber-900"
                >
                  コミュニティ Faucet <ExternalLink className="h-3 w-3" />
                </a>
                <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                  <p className="font-medium">💡 最新情報の確認:</p>
                  <div className="mt-1 text-xs text-amber-600">
                    X(旧Twitter)でJPYC関連アカウントを検索して最新情報をご確認ください
                  </div>
                </div>
              </div>

              {/* 開発用 */}
              <div className="bg-white border border-amber-200 rounded p-3">
                <h5 className="font-medium text-amber-900 mb-2">3. 開発・テスト用</h5>
                <p className="text-xs text-amber-700 mb-2">
                  QRコードスキャンのテストは手動入力でも可能
                </p>
                <div className="text-xs text-amber-600">
                  アプリの「スキャン」タブでサンプルデータをテスト
                </div>
              </div>
            </div>
          </div>

          {/* 現在のアドレス確認 */}
          <div className="bg-white border border-amber-200 rounded p-3">
            <h5 className="font-medium text-amber-900 mb-2">📝 あなたのアドレス:</h5>
            <div className="text-xs font-mono text-amber-800 break-all bg-amber-50 p-2 rounded">
              {address}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-800 underline hover:text-amber-900"
              >
                Etherscan確認 <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`https://sepolia.etherscan.io/token/0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB?a=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-800 underline hover:text-amber-900"
              >
                JPYC残高確認 <ExternalLink className="h-3 w-3" />
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(address || '')}
                className="text-xs text-amber-800 underline hover:text-amber-900"
              >
                コピー
              </button>
            </div>
            
            {/* トランザクション確認用 */}
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs font-medium text-blue-800 mb-1">🔍 Faucetトランザクション確認:</p>
              <p className="text-xs text-blue-700 mb-2">
                MetaMaskの「アクティビティ」タブで最新のトランザクションを確認し、
                「失敗」または「成功」の状態を確認してください。
              </p>
              <a
                href={`https://sepolia.etherscan.io/address/${address}#tokentxns`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-800 underline hover:text-blue-900"
              >
                トークン履歴確認 <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}