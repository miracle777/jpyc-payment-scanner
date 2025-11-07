'use client';

import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, AlertCircle, CheckCircle, Type, Smartphone } from 'lucide-react';

interface QRScannerComponentProps {
  onScanResult: (data: string) => void;
}

export function QRScannerComponent({ onScanResult }: QRScannerComponentProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return;

    try {
      setError(null);

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          onScanResult(result.data);
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
    } catch {
      setError('カメラの起動に失敗しました');
      setIsScanning(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScanResult(manualInput.trim());
      setManualInput('');
      setShowManualInput(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const checkCamera = async () => {
      try {
        const hasCamera = await QrScanner.hasCamera();
        if (mounted) {
          setHasCamera(hasCamera);
          if (!hasCamera) {
            setError('カメラが利用できません（手動入力をご利用ください）');
          }
        }
      } catch {
        if (mounted) {
          setHasCamera(false);
          setError('カメラの確認中にエラーが発生しました');
        }
      }
    };
    
    checkCamera();
    
    return () => {
      mounted = false;
      stopScanning();
    };
  }, []);

  if (hasCamera === null) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">カメラを確認中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* プラットフォーム情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-800 text-sm">
          <Smartphone className="h-4 w-4" />
          <span className="font-medium">最適な体験のために：</span>
        </div>
        <p className="text-blue-700 text-xs mt-1">
          QRスキャンはスマートフォンで最適に動作します。PCの場合は手動入力をご利用ください。
        </p>
      </div>

      {/* カメラビュー */}
      <div className="relative">
        <video
          ref={videoRef}
          className={`w-full rounded-lg ${isScanning ? 'block' : 'hidden'}`}
          style={{ aspectRatio: '4/3' }}
        />
        
        {!isScanning && (
          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-48">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                QRコードをスキャンしてください
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PCの場合は手動入力をお試しください
              </p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 border-2 border-blue-600 rounded-lg pointer-events-none">
            <div className="absolute inset-4 border border-white/50 rounded"></div>
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
              スキャン中...
            </div>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 手動入力セクション */}
      {showManualInput && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-800">手動入力</span>
          </div>
          <div className="space-y-2">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="QRコードのデータを入力してください（例：決済URL、アドレス、取引情報など）"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                データを送信
              </button>
              <button
                onClick={() => {
                  setShowManualInput(false);
                  setManualInput('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* コントロールボタン */}
      <div className="space-y-2">
        {/* カメラコントロール */}
        <div className="flex gap-2">
          {!isScanning ? (
            <button
              onClick={startScanning}
              disabled={!hasCamera}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {hasCamera ? 'カメラを起動' : 'カメラ利用不可'}
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

        {/* 手動入力トグル */}
        {!showManualInput && !isScanning && (
          <button
            onClick={() => setShowManualInput(true)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Type className="h-4 w-4" />
            手動でデータを入力
          </button>
        )}
      </div>

      {/* デモ用サンプルデータ */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="text-yellow-800 text-xs font-medium mb-2">💡 テスト用サンプルデータ：</div>
        <div className="space-y-1">
          {[
            'ethereum:0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd',
            'jpyc:amount=1000&to=0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd',
            'payment:merchant=TestShop&amount=500&currency=JPYC'
          ].map((sample, index) => (
            <button
              key={index}
              onClick={() => onScanResult(sample)}
              className="w-full text-left text-xs font-mono bg-white border border-yellow-300 rounded p-2 hover:bg-yellow-50 transition-colors text-gray-700 truncate"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* 使い方ガイド */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>📱 スマートフォン: QRコードをカメラに向けてスキャン</p>
        <p>💻 PC: 手動入力またはサンプルデータでテスト</p>
      </div>
    </div>
  );
}