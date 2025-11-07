'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, ArrowLeft, Copy } from 'lucide-react';
import { useState } from 'react';

interface PaymentSuccessProps {
  txHash: string;
  onNewPayment: () => void;
}

export function PaymentSuccess({ txHash, onNewPayment }: PaymentSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const etherscanUrl = `https://sepolia.etherscan.io/tx/${txHash}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center space-y-6"
    >
      {/* 成功アニメーション */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </motion.div>

      {/* 成功メッセージ */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          決済完了！
        </h3>
        <p className="text-gray-600">
          JPYC決済が正常に完了しました
        </p>
      </div>

      {/* トランザクション詳細 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">トランザクションハッシュ</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded p-2">
            <p className="text-xs font-mono text-gray-600 flex-1 break-all">
              {txHash}
            </p>
            <button
              onClick={() => handleCopy(txHash)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="コピー"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-1">コピーしました！</p>
          )}
        </div>

        <div className="flex items-center justify-center">
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Etherscanで確認
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* 決済情報サマリー */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">決済完了</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>ネットワーク:</span>
            <span>Sepolia testnet</span>
          </div>
          <div className="flex justify-between">
            <span>トークン:</span>
            <span>JPYC</span>
          </div>
          <div className="flex justify-between">
            <span>ステータス:</span>
            <span className="text-green-600 font-medium">成功</span>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-3">
        <button
          onClick={onNewPayment}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          新しい決済
        </button>
        
        <div className="text-xs text-gray-500">
          決済履歴は「履歴」タブで確認できます
        </div>
      </div>

      {/* 紙吹雪エフェクト用の要素 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded"
            initial={{ 
              x: '50%', 
              y: '50%',
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              x: `${50 + (Math.random() - 0.5) * 200}%`,
              y: `${50 + (Math.random() - 0.5) * 200}%`,
              scale: [0, 1, 0],
              rotate: 360
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}