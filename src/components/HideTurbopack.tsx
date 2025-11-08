'use client';

import { useEffect } from 'react';

export default function HideTurbopack() {
  useEffect(() => {
    const hideTurbopackButton = () => {
      // Turbopackボタンを特定して非表示にする
      const selectors = [
        // 一般的なNext.js開発ツール
        '[data-nextjs-turbopack-sidebar]',
        '[data-nextjs-turbopack-toast]',
        '#__next-build-watcher',
        '[data-nextjs-toast]',
        '.__next-dev-overlay-wrapper',
        // Turbopack特有
        'button[aria-label*="turbo"]',
        'button[aria-label*="Turbo"]',
        '[data-turbopack]',
        '[data-testid*="turbo"]',
        // Next.js 16特有
        'button[data-nextjs-inspector]',
        'div[data-nextjs-inspector]',
        '[class*="turbopack"]',
        '[class*="Turbopack"]',
        // 位置による特定
        'button[style*="position: fixed"][style*="bottom"]',
        'button[style*="position: fixed"][style*="left"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
            element.style.pointerEvents = 'none';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '-9999px';
            element.remove(); // 完全に削除
          }
        });
      });

      // 特定の条件でボタンを探す
      const allButtons = document.querySelectorAll('button');
      allButtons.forEach(button => {
        const style = window.getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        
        // 左下に位置する小さなボタンをターゲット
        if (
          style.position === 'fixed' && 
          rect.bottom > window.innerHeight - 100 && 
          rect.left < 100 &&
          rect.width < 100 &&
          rect.height < 100
        ) {
          button.style.display = 'none';
          button.remove();
        }

        // テキストが「N」のボタンを削除
        if (button.textContent?.trim() === 'N' || 
            button.innerHTML?.includes('N') ||
            button.getAttribute('aria-label')?.includes('inspector') ||
            button.getAttribute('aria-label')?.includes('turbo')) {
          button.style.display = 'none';
          button.remove();
        }
      });
    };

    // 初回実行
    hideTurbopackButton();

    // 定期的に実行（新しい要素が追加された場合に対応）
    const interval = setInterval(hideTurbopackButton, 1000);

    // DOMの変更を監視
    const observer = new MutationObserver(hideTurbopackButton);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // クリーンアップ
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null; // UIは何も描画しない
}