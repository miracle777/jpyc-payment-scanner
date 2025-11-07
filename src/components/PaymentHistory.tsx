'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar, ExternalLink, Trash2, RotateCcw } from 'lucide-react';

interface PaymentRecord {
  id: string;
  timestamp: number;
  amount: string;
  recipient: string;
  txHash?: string;
  status: 'completed' | 'pending' | 'failed';
}

export function PaymentHistory() {
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('jpyc-payment-history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('履歴の読み込みに失敗:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const loadHistoryFromStorage = () => {
      try {
        const stored = localStorage.getItem('jpyc-payment-history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('履歴の読み込みに失敗:', error);
      }
      setIsLoading(false);
    };
    
    loadHistoryFromStorage();
  }, []);

  const clearHistory = () => {
    if (confirm('決済履歴をすべて削除しますか？')) {
      localStorage.removeItem('jpyc-payment-history');
      setHistory([]);
    }
  };

  const removeItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('jpyc-payment-history', JSON.stringify(newHistory));
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'pending':
        return '処理中';
      case 'failed':
        return '失敗';
      default:
        return '不明';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            決済履歴
          </h3>
        </div>
        
        {history.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={loadHistory}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="更新"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={clearHistory}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="履歴をクリア"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            決済履歴がありません
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            QRコードをスキャンして決済を開始してください
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {history.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {record.amount} JPYC
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        送金先: {`${record.recipient.slice(0, 8)}...${record.recipient.slice(-6)}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(record.timestamp)}
                      </p>
                    </div>

                    {record.txHash && (
                      <div className="mt-2 flex items-center gap-2">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${record.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Etherscanで確認
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeItem(record.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ml-2"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 統計情報 */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {history.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  総取引数
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">
                  {history.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  成功
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold text-red-600">
                  {history.filter(r => r.status === 'failed').length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  失敗
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}