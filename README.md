# JPYC Payment Scanner

🚀 **完全機能実装済み** - 顧客側決済スキャナーアプリ - QRコードでかんたんJPYC決済

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=flat-square)](https://web.dev/progressive-web-apps/)

## ✨ プロジェクト概要

**2025年1月7日完成** - 本格的なJPYC決済アプリケーション

このアプリは、QRコードを使用してJPYC（JPY Coin）の決済を簡単に行うことができるPWA（Progressive Web App）です。店舗での支払いや個人間送金に活用できる実用的なアプリケーションとして開発されました。

### 🎯 主要機能

#### � 決済機能
- ✅ **QRコードスキャン** - カメラによるリアルタイムQR読み取り
- ✅ **手動入力対応** - カメラが使えない場合の代替手段
- ✅ **複数QR形式対応** - ethereum:, jpyc:, payment:形式
- ✅ **金額確認画面** - 詳細な決済情報表示
- ✅ **残高チェック** - 決済前の残高確認
- ✅ **MetaMask連携** - セキュアな送金実行
- ✅ **成功アニメーション** - 美しい紙吹雪エフェクト

#### 🔐 ウォレット機能
- ✅ **RainbowKit + wagmi** - 最新のWeb3接続フレームワーク
- ✅ **マルチネットワーク対応** - Sepolia testnet完全対応
- ✅ **リアルタイム残高表示** - ETH + JPYC残高の同時表示
- ✅ **正確なコントラクト対応** - 0xd3eF95d29A198868241FE374A999fc25F6152253

#### 📊 決済履歴機能（PWA対応）
- ✅ **ローカルストレージ保存** - データの永続化
- ✅ **メモ機能** - 誰に支払ったかを記録・編集
- ✅ **高度なフィルター機能**:
  - � 期間フィルター（今日/1週間/1ヶ月）
  - 📊 並び替え（新しい順/古い順/金額順）
  - 🔍 検索機能（メモや金額での絞り込み）
- ✅ **統計情報表示** - 総決済回数・総決済額
- ✅ **Etherscan連携** - トランザクション詳細確認
- ✅ **履歴の編集・削除** - 完全な履歴管理

#### 📱 PWA対応
- ✅ **Service Worker** - オフライン対応
- ✅ **ホーム画面追加** - ネイティブアプリのような体験
- ✅ **レスポンシブデザイン** - モバイル完全最適化
- ✅ **キャッシュ戦略** - 高速ロード

## 🛠 技術スタック

### フロントエンド
- **Next.js 16** + Turbopack - 最新のReactフレームワーク
- **TypeScript 5.0** - 型安全性の確保
- **Tailwind CSS 3.0** - ユーティリティファーストCSS
- **Framer Motion** - 美しいアニメーション

### Web3 / ブロックチェーン
- **RainbowKit 2.2** - モダンなウォレット接続UI
- **wagmi 2.0** - React向けEthereumライブラリ
- **viem** - 軽量なEthereumクライアント
- **Sepolia Testnet** - テスト環境対応

### 機能ライブラリ
- **qr-scanner 1.4** - QRコードスキャン機能
- **next-pwa 5.6** - PWA機能
- **Lucide React** - アイコンライブラリ

### 開発・品質管理
- **ESLint** + **Prettier** - コード品質管理
- **Tailwind Typography** - 文字体系の最適化

## 🎮 開発ハイライト・要点

### 🏆 プロジェクト成果
**開発期間**: 2025年1月7日（1日完結）  
**機能実装数**: 全12機能完全実装  
**テスト結果**: ✅ 全機能正常動作確認済み

### � 技術的成果
1. **正確なJPYCコントラクト対応**
   - 初期: 間違ったコントラクトアドレスで0残高表示
   - 解決: 正しいアドレス `0xd3eF95d29A198868241FE374A999fc25F6152253` 発見
   - 結果: 100 JPYC残高の正確な表示

2. **完全なPWA実装**
   - Service Worker による オフライン対応
   - ホーム画面追加機能
   - ローカルストレージによるデータ永続化

3. **実用的な決済履歴システム**
   - メモ機能による支払い相手の記録
   - 高度なフィルター・検索機能
   - 統計情報の可視化

### 🔄 開発フロー
```
プロジェクト初期化 → ウォレット接続 → QRスキャン → 
JPYC残高表示（デバッグ） → 決済UI → 履歴機能 → 
テスト完了 ✅
```

### 🧩 解決した技術課題

#### 1. JPYCコントラクトアドレス問題
**問題**: 公式ドキュメントと実際のコントラクトの不一致  
**解決**: コミュニティファウセットから正しいアドレス特定  
**学習**: テストネット環境では複数のコントラクトが存在する場合がある

#### 2. checksum validation エラー
**問題**: アドレスのチェックサム形式エラー  
**解決**: viem の `getAddress()` 関数による正規化  
**学習**: Ethereumアドレスの大小文字は重要

#### 3. PWAでの履歴管理
**問題**: ブラウザリロード時のデータ保持  
**解決**: localStorage による永続化  
**学習**: PWAではローカルストレージが重要

### 📊 実装した決済フロー
```
QRスキャン → データパース → 残高確認 → 
MetaMask署名 → 送金実行 → 履歴保存 → 
成功画面表示 ✅
```

### 🎯 実用性の確認
- ✅ **決済テスト**: 10 JPYC送金成功
- ✅ **履歴記録**: 自動保存・メモ編集機能
- ✅ **MetaMask統合**: トランザクション完了通知
- ✅ **Etherscan連携**: トランザクション詳細確認

## �🚀 セットアップ

### 1. プロジェクトのクローン

```bash
git clone https://github.com/miracle777/jpyc-payment-scanner.git
cd jpyc-payment-scanner
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```bash
# ウォレット接続用のWalletConnect Project ID
# https://dashboard.reown.com/sign-in で取得
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# 開発モード設定
NEXT_PUBLIC_ENVIRONMENT=development

# JPYC関連設定（Sepoliaテストネット）
# ⭐ 重要: 正しいコントラクトアドレス
NEXT_PUBLIC_JPYC_CONTRACT_ADDRESS=0xd3eF95d29A198868241FE374A999fc25F6152253
NEXT_PUBLIC_CHAIN_ID=11155111

# アプリ設定
NEXT_PUBLIC_APP_NAME=JPYC Payment Scanner
NEXT_PUBLIC_APP_DESCRIPTION=顧客側決済スキャナーアプリ
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

## 📱 使用方法

### 💳 基本的な決済フロー

#### 1. ウォレット接続
1. MetaMaskなどのウォレットアプリをインストール
2. Sepoliaテストネットに切り替え
3. 「ウォレット接続」ボタンをクリック

#### 2. テスト用JPYCの取得
- [JPYC Community Faucet](https://faucet.jpyc.jp/) でテスト用JPYCを取得
- 正しいコントラクト: `0xd3eF95d29A198868241FE374A999fc25F6152253`
- 少量のSepolia ETH（ガス代用）も必要

#### 3. QRコードスキャン
1. 「スキャン」タブを選択
2. QRコードをカメラでスキャン
3. または「サンプルデータを使用」でテスト

#### 4. 決済実行
1. 金額と送金先を確認
2. JPYC残高をチェック
3. 「決済実行」ボタンをクリック
4. MetaMaskで署名・承認
5. ✅ 決済完了！

### 📊 履歴機能の活用

#### メモ機能
- 決済後、履歴にメモを追加
- 支払い相手や目的を記録
- 後から編集・削除可能

#### フィルター・検索
- **期間**: 今日/1週間/1ヶ月
- **並び順**: 新しい順/金額順
- **検索**: メモや金額で検索

#### 統計確認
- 総決済回数と総決済額
- 決済パターンの分析

### 💡 活用例

#### 🏪 店舗での利用
```
店舗QRコード → カメラスキャン → 金額確認 → 
決済実行 → メモ「〇〇商店での買い物」
```

#### 👥 個人間送金
```
ethereum:0x5888578ad9a33Ce8a9FA3A0ca40816665bfaD8Fd
メモ「友人への食事代」として記録
```

#### 📱 PWAアプリとして
- スマートフォンのホーム画面に追加
- オフラインでも履歴確認可能
- ネイティブアプリのような操作感

## 🏗 プロジェクト構造

```
src/
├── app/
│   ├── globals.css          # グローバルスタイル
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # メインページ（タブ管理）
│   └── providers.tsx        # RainbowKit Provider設定
├── components/
│   ├── JPYCBalance.tsx      # JPYC残高表示
│   ├── PaymentScreen.tsx    # 決済確認・実行画面
│   ├── PaymentSuccess.tsx   # 決済完了画面
│   ├── PaymentHistoryScreen.tsx # 決済履歴管理
│   └── QRScannerSimple.tsx  # QRスキャナー
├── contracts/
│   └── jpyc.ts              # JPYCコントラクト設定
├── types/
│   └── payment.ts           # 決済関連の型定義
├── utils/
│   └── paymentStorage.ts    # 履歴ストレージ管理
└── public/
    ├── manifest.json        # PWA設定
    └── sw.js               # Service Worker
```

## 🌐 Sepoliaテストネットワーク設定

### 📋 ネットワーク情報

#### MetaMaskでのSepoliaテストネット追加
MetaMaskで以下の設定を行ってください：

**ネットワーク設定** （実際のMetaMaskスクリーンショット参考）:
- **ネットワーク名**: `Sepolia`
- **デフォルトのRPC URL**: `Infura` (sepolia.infura.io)
- **チェーンID**: `11155111`
- **通貨記号**: `SepoliaETH`
- **ブロックエクスプローラーのURL**: `sepolia.etherscan.io`

> 💡 **設定のコツ**: MetaMaskでは「デフォルトのRPC URL」でInfuraを選択すると自動的に適切な設定が適用されます。手動設定の場合は `https://sepolia.infura.io/v3/YOUR_PROJECT_ID` を使用してください。

#### ⚡ Sepolia ETH（ガス代）の取得

決済実行には少量のSepolia ETH（ガス代）が必要です：

**Sepolia ETH Faucet**:
- **Chainlink Faucet**: https://faucets.chain.link/sepolia
- **Alchemy Faucet**: https://sepoliafaucet.com/
- **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia
- **Paradigm Faucet**: https://faucet.paradigm.xyz/

### 🪙 JPYCトークン設定

#### 📍 公式JPYC（推奨）

**トークン追加手順**:
1. MetaMaskで「トークンをインポート」をクリック
2. 以下の情報を入力：

```
トークンコントラクトアドレス: 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB
トークンシンボル: JPYC
小数点以下の桁数: 18
```

**取得方法**:
- **公式Faucet**: https://faucet.jpyc.jp/
- **配布量**: 最大2,500 JPYC

#### 🌍 コミュニティJPYC

**トークン追加手順**:
```
トークンコントラクトアドレス: 0xd3eF95d29A198868241FE374A999fc25F6152253
トークンシンボル: JPYC
小数点以下の桁数: 18
```

**取得方法**:
- **コミュニティFaucet**: https://www.jpyc.cool/

### 🔧 設定確認手順

#### 1. ネットワーク確認
1. MetaMaskを開く
2. 上部のネットワーク名が「Sepolia test network」になっていることを確認
3. 異なる場合は、ネットワークを切り替え

#### 2. ETH残高確認
1. MetaMaskのメイン画面でETH残高を確認
2. 0.001 ETH以上あることを推奨（ガス代として）
3. 不足している場合は上記のFaucetで取得

#### 3. JPYCトークン表示
1. MetaMaskの「トークン」セクションを確認
2. JPYCが表示されない場合は「トークンをインポート」で追加
3. 残高が0の場合はFaucetで取得

#### 4. アプリ接続テスト
1. ブラウザで `http://localhost:3000` を開く
2. 「ウォレット接続」をクリック
3. MetaMaskが起動し、接続許可を求められる
4. 接続後、ウォレット情報とJPYC残高が表示される

### 📱 スマートフォンでの設定

#### MetaMask Mobileアプリ設定

**1. アプリインストール**:
- iOS: App Store からダウンロード
- Android: Google Play からダウンロード

**2. ネットワーク追加**:
1. MetaMask Mobileを開く
2. 上部のネットワーク名をタップ
3. 「ネットワークを追加」→「カスタムネットワーク」
4. 上記のSepolia設定情報を入力

**3. JPYCトークン追加**:
1. ホーム画面の「トークンをインポート」
2. コントラクトアドレスを入力
3. 自動的にシンボルと小数点が設定される

**4. Faucetからの取得**:
1. ブラウザでFaucetサイトを開く
2. MetaMaskでウォレットアドレスをコピー
3. Faucetでアドレスを入力して送信
4. トランザクション完了まで1-2分待機

### 🔍 トラブルシューティング

#### ❌ よくある問題と解決方法

**1. ネットワーク接続エラー**
- **症状**: アプリに接続できない
- **解決**: MetaMaskのネットワークがSepoliaに設定されているか確認

**2. ガス不足エラー**
- **症状**: 決済時に「insufficient funds」エラー
- **解決**: Sepolia ETHをFaucetから取得

**3. トークンが表示されない**
- **症状**: JPYC残高が0またはトークンが見えない
- **解決**: 正しいコントラクトアドレスでトークンを手動追加

**4. Faucetが動作しない**
- **症状**: Faucetから受け取れない
- **解決**: 24時間以内に受け取り済みかレート制限を確認

**5. 決済が完了しない**
- **症状**: MetaMaskで承認後も決済が進まない
- **解決**: ガス料金設定を「高速」に変更して再実行

### 📊 設定確認リスト

利用開始前に以下を確認してください：

- [ ] **Sepoliaネットワーク追加済み**
- [ ] **0.001 ETH以上のガス代確保済み**
- [ ] **JPYCトークン追加済み（公式またはコミュニティ）**
- [ ] **Faucetから テストJPYC取得済み**
- [ ] **ブラウザでアプリにアクセス可能**
- [ ] **MetaMaskとの接続成功**
- [ ] **スマートフォン環境（MetaMask Mobile設定）**

## ブロックチェーン情報

### Sepoliaテストネット設定
- **ネットワーク**: Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: `https://sepolia.infura.io/v3/`
- **通貨記号**: ETH

### 🪙 JPYCコントラクト情報
- **Contract Address**: `0xd3eF95d29A198868241FE374A999fc25F6152253`
- **Name**: JPYC
- **Symbol**: JPYC
- **Decimals**: 18
- **Type**: ERC-20 Token

### 🚰 Faucet情報
- **JPYC Faucet**: https://faucet.jpyc.jp/
- **Sepolia ETH Faucet**: 
  - [Chainlink Faucet](https://faucets.chain.link/sepolia)
  - [Alchemy Faucet](https://sepoliafaucet.com/)

## 🧪 テストシナリオ

### 決済テスト
1. ✅ **10 JPYC送金** - 基本的な送金機能
2. ✅ **残高不足エラー** - エラーハンドリング
3. ✅ **MetaMask署名** - ウォレット連携
4. ✅ **履歴保存** - データ永続化

### 履歴テスト
1. ✅ **自動保存** - 決済後の履歴記録
2. ✅ **メモ編集** - 支払い相手の記録
3. ✅ **フィルター** - 期間・金額での絞り込み
4. ✅ **検索機能** - メモでの検索

## 📈 今後の拡張可能性

### 💼 ビジネス機能
- 🏪 **店舗管理機能** - 複数店舗の管理
- 📊 **売上分析** - 詳細な統計情報
- 🧾 **レシート生成** - PDF出力機能
- 📧 **通知機能** - 決済完了メール

### 🔒 セキュリティ強化
- 🔐 **バイオメトリクス認証** - 指紋・Face ID
- 🛡️ **不正検知** - 異常な取引の検出
- 📱 **デバイス認証** - 端末の登録管理

### 🌐 ネットワーク拡張
- 🌟 **Ethereum Mainnet** - 本番環境対応
- 🔗 **マルチチェーン** - Polygon, BSC対応
- 🪙 **マルチトークン** - USDC, DAI対応

## 🎓 学習ポイント

### Web3開発
- **RainbowKit**: 最新のウォレット接続パターン
- **wagmi Hooks**: ReactでのEthereum操作
- **viem**: モダンなEthereumクライアント

### PWA開発
- **Service Worker**: オフライン対応
- **localStorage**: データ永続化
- **Responsive Design**: モバイル最適化

### UI/UX設計
- **Framer Motion**: 美しいアニメーション
- **Tailwind CSS**: 効率的なスタイリング
- **ユーザビリティ**: 直感的な操作フロー

## 📄 ライセンス

This project is licensed under the MIT License.

## 🙏 謝辞

このプロジェクトは、以下の技術やコミュニティの支援により実現されました：

- **JPYC株式会社** - テスト用トークンの提供
- **Rainbow Team** - 優れたウォレット接続ライブラリ
- **Ethereum Foundation** - Sepoliaテストネットの提供
- **Next.js Team** - 素晴らしい開発体験

---

**🎉 完全機能実装完了！** - 実用的なJPYC決済アプリケーション

*Last Updated: 2025年1月7日*

