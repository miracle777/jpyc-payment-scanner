'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { JPYC_CONFIG, JPYC_COMMUNITY_CONFIG, formatJPYCDisplay } from '@/contracts/jpyc';
import { PaymentHistoryStorage } from '@/utils/paymentStorage';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowRight,
  DollarSign,
  Clock,
  User,
  Building
} from 'lucide-react';

interface PaymentData {
  amount: string;
  recipient: string;
  merchant?: string;
  description?: string;
}

interface PaymentScreenProps {
  scannedData: string;
  selectedContract: 'official' | 'community';
  onBack: () => void;
  onSuccess: (txHash: string) => void;
}

export function PaymentScreen({ scannedData, selectedContract, onBack, onSuccess }: PaymentScreenProps) {
  const { address } = useAccount();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 選択されたコントラクトの設定を取得
  const currentContract = selectedContract === 'official' ? JPYC_CONFIG : JPYC_COMMUNITY_CONFIG;

  // JPYC残高取得
  const { data: balance } = useReadContract({
    address: currentContract.address,
    abi: currentContract.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: decimals } = useReadContract({
    address: currentContract.address,
    abi: currentContract.abi,
    functionName: 'decimals',
  });

  // JPYC送金処理
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // QRコードデータを解析
  const parseQRData = (data: string): PaymentData | null => {
    try {
      // パターン1: ethereum:address形式
      if (data.startsWith('ethereum:')) {
        const addressMatch = data.match(/ethereum:([0-9a-fA-Fx]+)/);
        if (addressMatch) {
          return {
            amount: '10', // デフォルト金額
            recipient: addressMatch[1],
            description: 'Ethereum アドレス宛送金'
          };
        }
      }

      // パターン2: jpyc:amount=xxx&to=xxx形式
      if (data.startsWith('jpyc:')) {
        const amountMatch = data.match(/amount=([0-9.]+)/);
        const toMatch = data.match(/to=([0-9a-fA-Fx]+)/);
        if (amountMatch && toMatch) {
          return {
            amount: amountMatch[1],
            recipient: toMatch[1],
            description: 'JPYC 決済'
          };
        }
      }

      // パターン3: payment:merchant=xxx&amount=xxx形式
      if (data.startsWith('payment:')) {
        const merchantMatch = data.match(/merchant=([^&]+)/);
        const amountMatch = data.match(/amount=([0-9.]+)/);
        const currencyMatch = data.match(/currency=([^&]+)/);
        
        if (merchantMatch && amountMatch) {
          return {
            amount: amountMatch[1],
            recipient: '0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd', // あなたのテスト用アドレス
            merchant: merchantMatch[1],
            description: `${merchantMatch[1]}での決済`
          };
        }
      }

      // パターン4: 直接アドレス形式
      if (/^0x[a-fA-F0-9]{40}$/.test(data)) {
        return {
          amount: '10',
          recipient: data,
          description: 'アドレス宛送金'
        };
      }

      // JSON形式の場合
      const parsed = JSON.parse(data);
      if (parsed.amount && parsed.recipient) {
        return parsed;
      }

      return null;
    } catch {
      return null;
    }
  };

  // 初期化時にQRデータを解析
  useState(() => {
    const parsed = parseQRData(scannedData);
    setPaymentData(parsed);
  });

  const handlePayment = async () => {
    if (!paymentData || !address) return;

    setIsProcessing(true);
    try {
      // JPYCトークンの送金実行
      const amount = BigInt(Number(paymentData.amount) * (10 ** (decimals as number || 18)));
      
      writeContract({
        address: currentContract.address,
        abi: currentContract.abi,
        functionName: 'transfer',
        args: [paymentData.recipient as `0x${string}`, amount],
      });
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  // トランザクション完了時に履歴を保存
  useEffect(() => {
    if (isConfirmed && hash && paymentData) {
      // 決済履歴を保存
      PaymentHistoryStorage.savePayment({
        transactionHash: hash,
        to: paymentData.recipient,
        amount: paymentData.amount,
        timestamp: Date.now(),
        memo: paymentData.merchant || paymentData.description || '',
        status: 'success',
        network: 'Sepolia testnet'
      });
      
      onSuccess(hash);
    }
  }, [isConfirmed, hash, paymentData, onSuccess]);

  // トランザクション完了時
  if (isConfirmed && hash) {
    return null;
  }

  if (!paymentData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            決済データを読み取れません
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            QRコードの形式が正しくありません
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs font-mono text-gray-700 break-all">
              {scannedData}
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            戻る
          </button>
        </div>
      </motion.div>
    );
  }

  const balanceValue = balance as bigint || BigInt(0);
  const decimalsValue = decimals as number || 18;
  const currentBalance = Number(balanceValue / BigInt(10 ** decimalsValue)); // JPYCを整数として計算
  const paymentAmount = Number(paymentData.amount);
  const hasEnoughBalance = currentBalance >= paymentAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 space-y-6"
    >
      {/* ヘッダー */}
      <div className="text-center">
        <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900">決済確認</h3>
        <p className="text-sm text-gray-600">決済内容をご確認ください</p>
      </div>

      {/* 決済詳細 */}
      <div className="space-y-4">
        {/* 金額 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">決済金額</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">
                {Number(paymentData.amount).toLocaleString('ja-JP')} JPYC
              </p>
              <p className="text-sm text-blue-600">
                ≈ {Number(paymentData.amount).toLocaleString('ja-JP')}円
              </p>
            </div>
          </div>
        </div>

        {/* 送金先情報 */}
        <div className="space-y-3">
          {paymentData.merchant && (
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">店舗名</p>
                <p className="font-medium text-gray-900">{paymentData.merchant}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">送金先アドレス</p>
              <p className="font-mono text-sm text-gray-800 break-all">
                {paymentData.recipient}
              </p>
            </div>
          </div>

          {paymentData.description && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">説明</p>
                <p className="text-sm text-gray-800">{paymentData.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* 残高確認 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              使用コントラクト: {selectedContract === 'official' ? '公式 JPYC' : 'コミュニティ JPYC'}
            </span>
            <span className="text-xs font-mono text-gray-400">
              {currentContract.address.slice(0, 6)}...{currentContract.address.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">現在の残高</span>
            <span className="font-medium text-gray-900">
              {formatJPYCDisplay(balanceValue, decimalsValue)} JPYC
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">決済後残高</span>
            <span className={`font-medium ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
              {hasEnoughBalance 
                ? `${(currentBalance - paymentAmount).toLocaleString('ja-JP')} JPYC`
                : '残高不足'
              }
            </span>
          </div>
        </div>
      </div>

      {/* 残高不足警告 */}
      {!hasEnoughBalance && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">残高不足</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            決済には {paymentAmount} JPYC必要ですが、残高が {currentBalance.toFixed(2)} JPYC しかありません。
          </p>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">決済エラー</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            {error.message}
          </p>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isPending || isConfirming}
          className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          キャンセル
        </button>
        
        <button
          onClick={handlePayment}
          disabled={!hasEnoughBalance || isPending || isConfirming}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isPending ? '承認待ち...' : '確認中...'}
            </>
          ) : (
            <>
              決済実行
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* 処理中メッセージ */}
      {(isPending || isConfirming) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            {isPending && 'MetaMaskで決済を承認してください...'}
            {isConfirming && 'ブロックチェーンで取引を確認中...'}
          </p>
        </div>
      )}
    </motion.div>
  );
}