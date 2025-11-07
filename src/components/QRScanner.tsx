'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, QrCode, AlertCircle } from 'lucide-react';

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    checkCameraAvailability();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);
      if (!hasCamera) {
        setError('カメラが利用できません');
      }
    } catch (err) {
      setHasCamera(false);
      setError('カメラの確認中にエラーが発生しました');
    }
  };

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return;

    try {
      setError(null);
      setScannedData(null);

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setScannedData(result.data);
          setIsScanning(false);
          scannerRef.current?.stop();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
    } catch (err) {
      setError('カメラの起動に失敗しました');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
  };

  if (hasCamera === null) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">カメラを確認中...</p>
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
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          QRコードスキャン
        </h3>
      </div>

      {!hasCamera ? (
        <div className="text-center py-8">
          <CameraOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            カメラが利用できません
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            デバイスにカメラが接続されているか確認してください
          </p>
        </div>
      ) : (
        <>
          {/* カメラビュー */}
          <div className="relative mb-4">
            <video
              ref={videoRef}
              className={`w-full rounded-lg ${isScanning ? 'block' : 'hidden'}`}
              style={{ aspectRatio: '4/3' }}
            />
            
            {!isScanning && !scannedData && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-48">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    QRコードをスキャンしてください
                  </p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 border-2 border-blue-600 rounded-lg pointer-events-none">
                <div className="absolute inset-4 border border-white/50 rounded"></div>
              </div>
            )}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* スキャン結果 */}
          {scannedData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4"
            >
              <h4 className="font-medium text-green-900 dark:text-green-400 mb-2">
                スキャン完了
              </h4>
              <p className="text-sm text-green-800 dark:text-green-300 font-mono break-all bg-white dark:bg-gray-800 p-2 rounded">
                {scannedData}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {/* TODO: 決済処理 */}}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  決済に進む
                </button>
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  再スキャン
                </button>
              </div>
            </motion.div>
          )}

          {/* コントロールボタン */}
          {!scannedData && (
            <div className="flex gap-2">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  disabled={!hasCamera}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  スキャン開始
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CameraOff className="h-4 w-4" />
                  停止
                </button>
              )}
            </div>
          )}

          {/* 使い方ガイド */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>QRコードをカメラに向けてスキャンしてください</p>
          </div>
        </>
      )}
    </motion.div>
  );
}