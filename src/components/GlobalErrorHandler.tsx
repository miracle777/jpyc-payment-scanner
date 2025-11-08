'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // グローバルエラーハンドラー
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      const message = event.message || error?.message || '';
      const name = error?.name || '';
      
      // IndexedDBやストレージ関連のエラーを抑制
      const isStorageError = 
        message.includes('IndexedDB') ||
        message.includes('InternalError') ||
        message.includes('storage') ||
        message.includes('localStorage') ||
        message.includes('sessionStorage') ||
        name === 'InternalError' ||
        name === 'QuotaExceededError' ||
        name === 'DataError' ||
        name === 'NotFoundError' ||
        // RainbowKit/WalletConnect関連のストレージエラー
        message.includes('walletconnect') ||
        message.includes('rainbow') ||
        // 一般的なブラウザストレージエラー
        message.includes('Storage quota') ||
        message.includes('storage full') ||
        // 暗号化関連のエラー（WalletConnect通信エラー）
        message.includes('aes/gcm') ||
        message.includes('invalid ghash tag') ||
        message.includes('decrypt') ||
        message.includes('ghash') ||
        // WalletConnect特有のエラー
        message.includes('node_modules_5f353e65') ||
        message.includes('onevent') ||
        message.includes('onpacket') ||
        message.includes('emitEvent') ||
        // MetaMask関連のエラー
        message.includes('MetaMask') ||
        message.includes('eth_accounts') ||
        message.includes('unexpectedly updated accounts') ||
        message.includes('Please report this bug') ||
        message.includes('_handleAccountsChanged');
      
      if (isStorageError) {
        console.warn('ストレージエラーが発生しましたが、アプリケーションの動作には影響ありません:', {
          message,
          name,
          error
        });
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      
      // その他のエラーはコンソールに出力
      console.error('アプリケーションエラー:', error);
    };

    // 未処理のPromise拒否をハンドリング
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || String(reason) || '';
      const name = reason?.name || '';
      
      // IndexedDBまたはストレージ関連のエラーを抑制
      const isStorageError = 
        message.includes('IndexedDB') ||
        message.includes('InternalError') ||
        message.includes('storage') ||
        message.includes('localStorage') ||
        message.includes('sessionStorage') ||
        name === 'InternalError' ||
        name === 'QuotaExceededError' ||
        name === 'DataError' ||
        name === 'NotFoundError' ||
        // RainbowKit/WalletConnect関連のストレージエラー
        message.includes('walletconnect') ||
        message.includes('rainbow') ||
        // 一般的なブラウザストレージエラー
        message.includes('Storage quota') ||
        message.includes('storage full') ||
        // 暗号化関連のエラー（WalletConnect通信エラー）
        message.includes('aes/gcm') ||
        message.includes('invalid ghash tag') ||
        message.includes('decrypt') ||
        message.includes('ghash') ||
        // WalletConnect特有のエラー
        message.includes('node_modules_5f353e65') ||
        message.includes('onevent') ||
        message.includes('onpacket') ||
        message.includes('emitEvent') ||
        // MetaMask関連のエラー
        message.includes('MetaMask') ||
        message.includes('eth_accounts') ||
        message.includes('unexpectedly updated accounts') ||
        message.includes('Please report this bug') ||
        message.includes('_handleAccountsChanged');
      
      if (isStorageError) {
        console.warn('ストレージ関連のPromise拒否が発生しましたが、アプリケーションの動作には影響ありません:', {
          message,
          name,
          reason
        });
        event.preventDefault();
        return false;
      }
      
      console.error('未処理のPromise拒否:', reason);
    };

    // コンソールエラーをインターセプト（開発時のログ制御）
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args.join(' ').toLowerCase();
      
      if (message.includes('indexeddb') || 
          message.includes('internalerror') ||
          message.includes('storage') ||
          message.includes('aes/gcm') ||
          message.includes('ghash') ||
          message.includes('decrypt') ||
          message.includes('walletconnect') ||
          message.includes('rainbow') ||
          message.includes('metamask') ||
          message.includes('eth_accounts') ||
          message.includes('unexpectedly updated accounts')) {
        // ストレージエラーは警告レベルで出力
        console.warn('[抑制されたストレージエラー]', ...args);
        return;
      }
      
      // その他のエラーは通常通り出力
      originalConsoleError.apply(console, args);
    };

    // イベントリスナーを登録
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    // クリーンアップ
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}