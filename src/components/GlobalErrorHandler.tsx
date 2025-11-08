'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // グローバルエラーハンドラー
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      
      // IndexedDBエラーを抑制
      if (error?.message?.includes('IndexedDB') || 
          error?.name === 'InternalError' ||
          event.message?.includes('IndexedDB')) {
        console.warn('IndexedDBエラーが発生しましたが、アプリケーションの動作には影響ありません:', error);
        event.preventDefault();
        return;
      }
      
      // その他のエラーはコンソールに出力
      console.error('アプリケーションエラー:', error);
    };

    // 未処理のPromise拒否をハンドリング
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // IndexedDBまたはストレージ関連のエラーを抑制
      if (reason?.message?.includes('IndexedDB') || 
          reason?.message?.includes('storage') ||
          reason?.name === 'InternalError') {
        console.warn('ストレージエラーが発生しましたが、アプリケーションの動作には影響ありません:', reason);
        event.preventDefault();
        return;
      }
      
      console.error('未処理のPromise拒否:', reason);
    };

    // イベントリスナーを登録
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // クリーンアップ
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}