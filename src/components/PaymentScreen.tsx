'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther, isAddress, getAddress } from 'viem';
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
  merchantId?: string;
  merchantDescription?: string;
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

  // 選択されたコントラクトの設定を取得
  const currentContract = selectedContract === 'official' ? JPYC_CONFIG : JPYC_COMMUNITY_CONFIG;

  // アドレス検証・正規化ヘルパー
  const validateAndFormatAddress = (addr: string): string | null => {
    try {
      // 空文字列やnullの場合
      if (!addr || typeof addr !== 'string') {
        console.log('❌ Address is empty or invalid type:', addr);
        return null;
      }

      // アドレスの前後の空白を除去
      const trimmedAddr = addr.trim();
      
      // 0x prefixがない場合は追加
      const prefixedAddr = trimmedAddr.startsWith('0x') ? trimmedAddr : `0x${trimmedAddr}`;
      
      console.log('🔍 Validating address:', prefixedAddr);

      // アドレスの形式チェック
      if (!isAddress(prefixedAddr)) {
        console.log('❌ Invalid address format:', prefixedAddr);
        return null;
      }

      // チェックサム付きアドレスに正規化
      const checksumAddress = getAddress(prefixedAddr);
      console.log('✅ Validated and normalized address:', checksumAddress);
      return checksumAddress;
    } catch (error) {
      console.error('❌ Address validation error:', error, 'for address:', addr);
      return null;
    }
  };

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
  const parseQRData = useCallback((data: string): PaymentData | null => {
    try {
      console.log('🔍 Parsing QR data:', data);

      // JSON形式の場合（新しい形式）
      try {
        const parsed = JSON.parse(data);
        console.log('📊 Parsed JSON:', parsed);
        
        // JPYC_PAYMENT形式
        if (parsed.type === 'JPYC_PAYMENT') {
          const validatedAddress = validateAndFormatAddress(parsed.to);
          if (!validatedAddress) {
            console.log('❌ Invalid recipient address in JPYC_PAYMENT:', parsed.to);
            return null;
          }
          
          const result = {
            amount: parsed.amount || '10',
            recipient: validatedAddress,
            merchant: parsed.merchant?.name || parsed.contractName || `${parsed.currency || 'JPYC'} 決済`,
            description: `${parsed.contractName || '公式JPYC'} による決済 (${parsed.network || 'sepolia'})`,
            merchantId: parsed.merchant?.id,
            merchantDescription: parsed.merchant?.description
          };
          console.log('✅ JPYC_PAYMENT format parsed:', result);
          return result;
        }

        // 一般的なJSONフォーマット
        if (parsed.amount && (parsed.recipient || parsed.to)) {
          const targetAddress = parsed.recipient || parsed.to;
          const validatedAddress = validateAndFormatAddress(targetAddress);
          if (!validatedAddress) {
            console.log('❌ Invalid recipient address in generic JSON:', targetAddress);
            return null;
          }
          
          const result = {
            amount: parsed.amount,
            recipient: validatedAddress,
            merchant: parsed.merchant,
            description: parsed.description || 'JSON形式の決済'
          };
          console.log('✅ Generic JSON format parsed:', result);
          return result;
        }
      } catch {
        console.log('📝 Not JSON format, trying other patterns...');
      }

      // パターン1: ethereum:address形式
      if (data.startsWith('ethereum:')) {
        const addressMatch = data.match(/ethereum:([0-9a-fA-Fx]+)/);
        if (addressMatch) {
          const validatedAddress = validateAndFormatAddress(addressMatch[1]);
          if (!validatedAddress) {
            console.log('❌ Invalid address in ethereum format:', addressMatch[1]);
            return null;
          }
          return {
            amount: '10', // デフォルト金額
            recipient: validatedAddress,
            description: 'Ethereum アドレス宛送金'
          };
        }
      }

      // パターン2: jpyc:amount=xxx&to=xxx形式
      if (data.startsWith('jpyc:')) {
        const amountMatch = data.match(/amount=([0-9.]+)/);
        const toMatch = data.match(/to=([0-9a-fA-Fx]+)/);
        if (amountMatch && toMatch) {
          const validatedAddress = validateAndFormatAddress(toMatch[1]);
          if (!validatedAddress) {
            console.log('❌ Invalid address in jpyc format:', toMatch[1]);
            return null;
          }
          return {
            amount: amountMatch[1],
            recipient: validatedAddress,
            description: 'JPYC 決済'
          };
        }
      }

      // パターン3: payment:merchant=xxx&amount=xxx形式
      if (data.startsWith('payment:')) {
        const merchantMatch = data.match(/merchant=([^&]+)/);
        const amountMatch = data.match(/amount=([0-9.]+)/);
        
        if (merchantMatch && amountMatch) {
          const defaultAddress = '0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd';
          const validatedAddress = validateAndFormatAddress(defaultAddress);
          if (!validatedAddress) {
            console.log('❌ Invalid default address:', defaultAddress);
            return null;
          }
          return {
            amount: amountMatch[1],
            recipient: validatedAddress,
            merchant: merchantMatch[1],
            description: `${merchantMatch[1]}での決済`
          };
        }
      }

      // パターン4: 直接アドレス形式
      if (/^0x[a-fA-F0-9]{40}$/.test(data)) {
        const validatedAddress = validateAndFormatAddress(data);
        if (!validatedAddress) {
          console.log('❌ Invalid direct address:', data);
          return null;
        }
        return {
          amount: '10',
          recipient: validatedAddress,
          description: 'アドレス宛送金'
        };
      }

      console.log('❌ No pattern matched for:', data);
      return null;
    } catch (error) {
      console.error('❌ Parse error:', error);
      return null;
    }
  }, []);

  // 初期化時にQRデータを解析
  useEffect(() => {
    const parsed = parseQRData(scannedData);
    console.log('🎯 Final parsed data:', parsed);
    setPaymentData(parsed);
  }, [scannedData, parseQRData]);

  const handlePayment = async () => {
    if (!paymentData || !address) return;

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
    }
  };

  // トランザクション完了時に履歴を保存
  useEffect(() => {
    if (isConfirmed && hash && paymentData) {
      try {
        // 決済履歴を保存
        const savedPayment = PaymentHistoryStorage.savePayment({
          transactionHash: hash,
          to: paymentData.recipient,
          amount: paymentData.amount,
          timestamp: Date.now(),
          memo: paymentData.merchant ? 
            `${paymentData.merchant}${paymentData.merchantId ? ` (ID: ${paymentData.merchantId})` : ''}` :
            paymentData.description || '',
          status: 'success',
          network: 'Sepolia testnet'
        });
        
        console.log('決済履歴を保存しました:', savedPayment.id);
      } catch (error) {
        console.error('決済履歴の保存でエラーが発生しました:', error);
        // 履歴保存の失敗は決済成功には影響しない
      }
      
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
            QRコードの形式が正しくないか、アドレスが無効です
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs font-mono text-gray-700 break-all">
              {scannedData}
            </p>
          </div>
          
          {/* デバッグ情報 */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-semibold text-blue-800 mb-2">🔍 デバッグ情報:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <p>• データ長: {scannedData.length} 文字</p>
              <p>• JSON形式: {(() => {
                try { 
                  JSON.parse(scannedData); 
                  return '✅ 有効'; 
                } catch { 
                  return '❌ 無効'; 
                }
              })()}</p>
              <p>• 受信者アドレス: {(() => {
                try {
                  const parsed = JSON.parse(scannedData);
                  if (parsed.to) {
                    if (parsed.to === '0x...' || parsed.to.length < 42) {
                      return `❌ 不完全 (${parsed.to})`;
                    }
                    return isAddress(parsed.to) ? '✅ 有効' : '❌ 形式無効';
                  }
                  return '❓ アドレス未検出';
                } catch {
                  return '❓ JSON解析失敗';
                }
              })()}</p>
              <p>• 店舗情報: {(() => {
                try {
                  const parsed = JSON.parse(scannedData);
                  return parsed.merchant?.name ? `✅ ${parsed.merchant.name}` : '❌ なし';
                } catch {
                  return '❓ 解析失敗';
                }
              })()}</p>
            </div>
          </div>
          
          {/* 解決方法の提案 */}
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-semibold text-yellow-800 mb-2">💡 解決方法:</p>
            <div className="space-y-1 text-xs text-yellow-700">
              <p>1. 支払いプログラム側で実際の受信者アドレスを設定</p>
              <p>2. QRコードを再生成して再度スキャン</p>
              <p>3. または手動入力でテスト用アドレスを使用</p>
            </div>
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
                {paymentData.merchantId && (
                  <p className="text-xs text-gray-500 font-mono">ID: {paymentData.merchantId}</p>
                )}
                {paymentData.merchantDescription && (
                  <p className="text-sm text-gray-600 mt-1">{paymentData.merchantDescription}</p>
                )}
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

          {paymentData.description && !paymentData.merchant && (
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