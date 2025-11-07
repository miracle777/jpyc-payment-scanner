'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentHistory, PaymentFilter } from '@/types/payment';
import { PaymentHistoryStorage } from '@/utils/paymentStorage';
import { 
  Calendar, 
  Search, 
  Edit3, 
  Trash2,
  ExternalLink,
  Clock,
  DollarSign,
  User
} from 'lucide-react';

export default function PaymentHistoryScreen() {
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [filter, setFilter] = useState<PaymentFilter>({ 
    period: 'all', 
    sortBy: 'newest',
    search: ''
  });
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [tempMemo, setTempMemo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const filteredHistory = PaymentHistoryStorage.getFilteredHistory(filter);
      setHistory(filteredHistory);
    } catch (error) {
      console.error('履歴読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMemo = (id: string, memo: string) => {
    const success = PaymentHistoryStorage.updateMemo(id, memo);
    if (success) {
      loadHistory();
      setEditingMemo(null);
    }
  };

  const handleDeletePayment = (id: string) => {
    if (confirm('この決済履歴を削除しますか？')) {
      const success = PaymentHistoryStorage.deletePayment(id);
      if (success) {
        loadHistory();
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEtherscanUrl = (hash: string) => {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 期間フィルター */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              期間
            </label>
            <select
              value={filter.period}
              onChange={(e) => setFilter(prev => ({ ...prev, period: e.target.value as any }))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全期間</option>
              <option value="today">今日</option>
              <option value="week">1週間</option>
              <option value="month">1ヶ月</option>
            </select>
          </div>

          {/* ソート */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              並び順
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="amount_high">金額の大きい順</option>
              <option value="amount_low">金額の小さい順</option>
            </select>
          </div>
        </div>

        {/* 検索 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <Search className="w-3 h-3 inline mr-1" />
            検索
          </label>
          <input
            type="text"
            placeholder="メモ、金額、アドレス..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

        {/* 履歴リスト */}
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              決済履歴がありません
            </h3>
            <p className="text-xs text-gray-600">
              決済を行うと履歴がここに表示されます
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {history.slice(0, 10).map((payment, index) => ( // 最大10件表示
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded p-3 bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-bold text-gray-900 truncate">
                          {payment.amount} JPYC
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          payment.status === 'success' 
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status === 'success' ? '成功' : 
                           payment.status === 'failed' ? '失敗' : '処理中'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">宛先:</span>
                          <span className="font-mono">{formatAddress(payment.to)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">日時:</span>
                          <span>{formatDate(payment.timestamp)}</span>
                        </div>
                      </div>

                      {/* メモ */}
                      <div className="mt-2">
                        {editingMemo === payment.id ? (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={tempMemo}
                              onChange={(e) => setTempMemo(e.target.value)}
                              placeholder="支払い相手や目的..."
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateMemo(payment.id, tempMemo)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingMemo(null)}
                              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-600 flex-1 truncate">
                              {payment.memo || 'メモなし'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingMemo(payment.id);
                                setTempMemo(payment.memo || '');
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* アクション */}
                    <div className="flex gap-1 ml-2">
                      <a
                        href={getEtherscanUrl(payment.transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Etherscanで確認"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="削除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {history.length > 10 && (
              <div className="text-center text-xs text-gray-500 py-2">
                {history.length - 10}件の履歴があります
              </div>
            )}
          </div>
        )}

        {/* 統計情報 */}
        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">統計情報</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-blue-50 rounded p-2">
                <div className="text-lg font-bold text-blue-600">
                  {history.length}
                </div>
                <div className="text-xs text-gray-600">総決済回数</div>
              </div>
              <div className="bg-green-50 rounded p-2">
                <div className="text-lg font-bold text-green-600">
                  {history.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">総決済額 (JPYC)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }