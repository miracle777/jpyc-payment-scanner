// 決済履歴の型定義
export interface PaymentHistory {
  id: string;                    // ユニークID
  transactionHash: string;       // トランザクションハッシュ
  to: string;                    // 送金先アドレス
  amount: string;                // 送金額（JPYC）
  timestamp: number;             // タイムスタンプ
  memo?: string;                 // メモ（誰に支払ったかなど）
  status: 'success' | 'failed' | 'pending'; // ステータス
  network: string;               // ネットワーク名
}

// 決済履歴のフィルター条件
export interface PaymentFilter {
  period?: 'all' | 'today' | 'week' | 'month';
  sortBy?: 'newest' | 'oldest' | 'amount_high' | 'amount_low';
  search?: string;               // メモや金額での検索
}