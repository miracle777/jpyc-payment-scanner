'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, QrCode, AlertCircle } from 'lucide-react';

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const checkCameraAvailability = useCallback(async () => {
    try {
      const hasCamera = await QrScanner.hasCamera();
      setHasCamera(hasCamera);
      if (!hasCamera) {
        setError('カメラが利用できません');
      }
    } catch (err) {
      console.error('Camera availability check failed:', err);
      setHasCamera(false);
      setError('カメラの確認中にエラーが発生しました');
    }
  }, []);

  const checkCameraPermissionAndAvailability = useCallback(async () => {
    try {
      // まず権限を確認
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionStatus(permission.state);
          
          permission.onchange = () => {
            setPermissionStatus(permission.state);
          };
        } catch (permErr) {
          console.log('Permissions API not supported:', permErr);
        }
      }

      // カメラの利用可能性を確認
      await checkCameraAvailability();
    } catch (err) {
      console.error('Camera check error:', err);
      setHasCamera(false);
      setError('カメラの確認中にエラーが発生しました');
    }
  }, [checkCameraAvailability]);

  const requestCameraPermission = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // 権限が取得できたらストリームを停止
      stream.getTracks().forEach(track => track.stop());
      
      // 権限状態を更新
      setPermissionStatus('granted');
      await checkCameraAvailability();
    } catch (err) {
      console.error('Permission request failed:', err);
      const error = err as Error & { name?: string };
      if (error.name === 'NotAllowedError') {
        setError('カメラへのアクセスが拒否されました。ブラウザの設定でカメラの使用を許可してください。');
        setPermissionStatus('denied');
      } else if (error.name === 'NotFoundError') {
        setError('カメラが見つかりません。デバイスにカメラが接続されているか確認してください。');
      } else {
        setError('カメラへのアクセスに失敗しました: ' + error.message);
      }
    }
  }, [checkCameraAvailability]);

  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      if (mounted) {
        await checkCameraPermissionAndAvailability();
      }
    };
    
    initCamera();
    
    return () => {
      mounted = false;
      stopScanning();
    };
  }, [checkCameraPermissionAndAvailability, stopScanning]);

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return;

    try {
      setError(null);
      setScannedData(null);

      // QrScannerの初期化
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          setScannedData(result.data);
          setIsScanning(false);
          scannerRef.current?.stop();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 5,
          calculateScanRegion: () => ({
            x: 0.1,
            y: 0.1, 
            width: 0.8,
            height: 0.8
          })
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
    } catch (err) {
      console.error('Scanner start failed:', err);
      const error = err as Error & { name?: string };
      if (error.name === 'NotAllowedError') {
        setError('カメラへのアクセスが拒否されました。ブラウザの設定でカメラの使用を許可してください。');
      } else if (error.name === 'NotFoundError') {
        setError('カメラが見つかりません');
      } else {
        setError('カメラの起動に失敗しました: ' + (error.message || error));
      }
      setIsScanning(false);
    }
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
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            デバイスにカメラが接続されているか確認してください
          </p>
          {permissionStatus === 'denied' && (
            <button
              onClick={requestCameraPermission}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              カメラ権限を再要求
            </button>
          )}
        </div>
      ) : (
        <>
          {/* カメラビュー */}
          <div className="relative mb-4">
            <video
              ref={videoRef}
              className={`w-full rounded-lg ${isScanning ? 'block' : 'hidden'}`}
              style={{ aspectRatio: '4/3' }}
              autoPlay
              muted
              playsInline
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
                <div className="absolute top-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                  QRコードをフレーム内に合わせてください
                </div>
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
              {permissionStatus === 'denied' && (
                <button
                  onClick={requestCameraPermission}
                  className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                >
                  カメラ権限を再要求
                </button>
              )}
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
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
            <p>QRコードをカメラに向けてスキャンしてください</p>
            <p>💡 HTTPSでアクセスしている場合、カメラが利用できます</p>
          </div>
        </>
      )}
    </motion.div>
  );
}