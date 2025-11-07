import { PaymentHistory, PaymentFilter } from '@/types/payment';

const STORAGE_KEY = 'jpyc-payment-history';

export class PaymentHistoryStorage {
  // 決済履歴を保存
  static savePayment(payment: Omit<PaymentHistory, 'id'>): PaymentHistory {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const paymentWithId: PaymentHistory = {
      ...payment,
      id
    };
    
    const history = this.getHistory();
    history.unshift(paymentWithId); // 新しいものを先頭に追加
    
    // 最大1000件まで保存（古いものを削除）
    if (history.length > 1000) {
      history.splice(1000);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return paymentWithId;
  }

  // 全ての決済履歴を取得
  static getHistory(): PaymentHistory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('決済履歴の取得に失敗しました:', error);
      return [];
    }
  }

  // フィルター済みの履歴を取得
  static getFilteredHistory(filter: PaymentFilter = {}): PaymentHistory[] {
    let history = this.getHistory();

    // 期間フィルター
    if (filter.period && filter.period !== 'all') {
      const now = Date.now();
      let startTime = 0;
      
      switch (filter.period) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          startTime = today.getTime();
          break;
        case 'week':
          startTime = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startTime = now - (30 * 24 * 60 * 60 * 1000);
          break;
      }
      
      history = history.filter(item => item.timestamp >= startTime);
    }

    // 検索フィルター
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      history = history.filter(item => 
        (item.memo?.toLowerCase().includes(searchLower)) ||
        item.amount.includes(filter.search!) ||
        item.to.toLowerCase().includes(searchLower)
      );
    }

    // ソート
    if (filter.sortBy) {
      switch (filter.sortBy) {
        case 'newest':
          history.sort((a, b) => b.timestamp - a.timestamp);
          break;
        case 'oldest':
          history.sort((a, b) => a.timestamp - b.timestamp);
          break;
        case 'amount_high':
          history.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
          break;
        case 'amount_low':
          history.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
          break;
      }
    }

    return history;
  }

  // メモを更新
  static updateMemo(id: string, memo: string): boolean {
    try {
      const history = this.getHistory();
      const index = history.findIndex(item => item.id === id);
      
      if (index === -1) return false;
      
      history[index].memo = memo;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('メモの更新に失敗しました:', error);
      return false;
    }
  }

  // 履歴を削除
  static deletePayment(id: string): boolean {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
      return true;
    } catch (error) {
      console.error('履歴の削除に失敗しました:', error);
      return false;
    }
  }

  // 全履歴をクリア
  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // エクスポート用にJSONとして取得
  static exportHistory(): string {
    return JSON.stringify(this.getHistory(), null, 2);
  }

  // インポート（バックアップから復元）
  static importHistory(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as PaymentHistory[];
      // 基本的なバリデーション
      if (!Array.isArray(imported)) return false;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      return true;
    } catch (error) {
      console.error('履歴のインポートに失敗しました:', error);
      return false;
    }
  }
}