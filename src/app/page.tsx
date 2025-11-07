'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { QrCode, Wallet, History, User, LucideIcon } from 'lucide-react';
import { QRScannerComponent } from '@/components/QRScannerSimple';
import { JPYCBalance } from '@/components/JPYCBalance';
import { JPYCBalanceChecker } from '@/components/JPYCBalanceChecker';
import { JPYCTestHelper } from '@/components/JPYCTestHelper';
import { PaymentScreen } from '@/components/PaymentScreen';
import { PaymentSuccess } from '@/components/PaymentSuccess';
import PaymentHistoryScreen from '@/components/PaymentHistoryScreen';

// タブコンポーネント（render外で定義）
interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, icon: Icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

export default function Home() {
  const { isConnected, address, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const [activeTab, setActiveTab] = useState<'scan' | 'wallet' | 'history'>('scan');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'scan' | 'confirm' | 'success'>('scan');
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

  const handleScanResult = (data: string) => {
    setScannedData(data);
    setPaymentStep('confirm');
  };

  const resetScan = () => {
    setScannedData(null);
    setPaymentStep('scan');
    setSuccessTxHash(null);
  };

  const handlePaymentSuccess = (txHash: string) => {
    setSuccessTxHash(txHash);
    setPaymentStep('success');
  };

  const handleNewPayment = () => {
    resetScan();
    setActiveTab('scan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              JPYC Scanner
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            QRコードでかんたんJPYC決済 🚀
          </p>
        </motion.header>

        {/* ウォレット接続セクション */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="text-center">
              <Wallet className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <ConnectButton />
            </div>
          </div>
        </motion.div>

        {/* ウォレット情報（接続時のみ表示） */}
        {isConnected && address && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">ウォレット情報</h3>
              <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500 block">アドレス</label>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {`${address.slice(0, 8)}...${address.slice(-6)}`}
                </p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <label className="text-xs font-medium text-gray-500 block">ネットワーク</label>
                  <p className="text-sm text-gray-800">{chain?.name || 'Unknown'}</p>
                </div>
                {balance && (
                  <div className="text-right">
                    <label className="text-xs font-medium text-gray-500 block">ETH残高</label>
                    <p className="text-sm text-gray-800">
                      {parseFloat(balance.formatted).toFixed(4)} ETH
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* JPYC残高表示 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <JPYCBalance />
            </div>
          </motion.div>
        )}

        {/* タブナビゲーション（接続時のみ表示） */}
        {isConnected && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-1.5 shadow-lg border border-gray-200 mb-6"
            >
              <div className="flex space-x-1">
                <TabButton
                  label="スキャン"
                  icon={QrCode}
                  isActive={activeTab === 'scan'}
                  onClick={() => setActiveTab('scan')}
                />
                <TabButton
                  label="ウォレット"
                  icon={Wallet}
                  isActive={activeTab === 'wallet'}
                  onClick={() => setActiveTab('wallet')}
                />
                <TabButton
                  label="履歴"
                  icon={History}
                  isActive={activeTab === 'history'}
                  onClick={() => setActiveTab('history')}
                />
              </div>
            </motion.div>

            {/* タブコンテンツ */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              {activeTab === 'scan' && (
                <div>
                  {paymentStep === 'scan' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">QRコードスキャン</h3>
                      <QRScannerComponent onScanResult={handleScanResult} />
                    </div>
                  )}
                  
                  {paymentStep === 'confirm' && scannedData && (
                    <PaymentScreen
                      scannedData={scannedData}
                      onBack={resetScan}
                      onSuccess={handlePaymentSuccess}
                    />
                  )}
                  
                  {paymentStep === 'success' && successTxHash && (
                    <PaymentSuccess
                      txHash={successTxHash}
                      onNewPayment={handleNewPayment}
                    />
                  )}
                </div>
              )}
              
              {activeTab === 'wallet' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細なウォレット情報</h3>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">完全なアドレス</label>
                        <div className="text-xs font-mono text-gray-600 bg-gray-50 rounded p-2 break-all">
                          {address}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">チェーンID</label>
                        <p className="text-sm text-gray-800">{chain?.id}</p>
                      </div>
                    </div>
                    
                    {/* テスト用JPYC取得ヘルプ */}
                    <JPYCTestHelper />
                    
                    {/* 任意アドレスの残高確認 */}
                    <JPYCBalanceChecker />
                  </div>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">決済履歴</h3>
                  <PaymentHistoryScreen />
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* 未接続時のガイド */}
        {!isConnected && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              ご利用方法
            </h2>
            <div className="space-y-3">
              {[
                'MetaMaskなどのウォレットを接続',
                'QRコードをスキャンして決済情報を取得',  
                '金額を確認してJPYCで決済完了'
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
              Sepoliaテストネット対応
            </div>
          </motion.div>
        )}

        {/* フッター */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center space-y-1 text-xs text-gray-500"
        >
          <p>✅ Next.js 16 + Turbopack</p>
          <p>✅ TypeScript + Tailwind CSS</p>
          <p>✅ RainbowKit + wagmi</p>
        </motion.footer>
      </div>
    </div>
  );
}
