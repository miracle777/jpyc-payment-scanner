'use client';

import Link from 'next/link';
import { Wifi, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* オフラインアイコン */}
        <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          <Wifi className="h-10 w-10 text-gray-400" />
        </div>

        {/* タイトル */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            オフライン
          </h1>
          <p className="text-gray-600">
            インターネット接続が利用できません
          </p>
        </div>

        {/* 説明 */}
        <div className="bg-white rounded-lg p-4 text-left">
          <h2 className="font-medium text-gray-900 mb-2">利用可能な機能:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 決済履歴の閲覧（保存済みデータ）</li>
            <li>• アプリの基本操作</li>
            <li>• 設定の確認</li>
          </ul>
          <h2 className="font-medium text-gray-900 mt-4 mb-2">制限される機能:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• QRコードスキャン</li>
            <li>• ウォレット接続</li>
            <li>• 新規決済</li>
            <li>• 残高確認</li>
          </ul>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            再接続を試す
          </button>
          
          <Link
            href="/"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
          >
            ホームに戻る
          </Link>
        </div>

        {/* フッター */}
        <div className="text-xs text-gray-500 mt-8">
          <p>JPYC Payment Scanner</p>
          <p>ネットワーク接続を確認してください</p>
        </div>
      </div>
    </div>
  );
}