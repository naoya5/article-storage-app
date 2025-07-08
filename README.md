# 📚 記事ストックアプリ

Twitter(X)、Zenn、Qiitaから記事をストック・管理できるNext.jsアプリケーションです。記事をジャンルやタグで分類し、高機能な検索でお気に入りの記事をすばやく見つけることができます。

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.18.0-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan)
![Vitest](https://img.shields.io/badge/Vitest-3.2.4-yellow)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.11-orange)

## ✨ 主な機能

### 🔐 認証システム
- **Google/GitHub OAuth**: シームレスなソーシャルログイン
- **セッション管理**: 安全で持続的なログイン状態

### 📝 記事管理
- **自動メタデータ取得**: URL入力だけで記事情報を自動取得
- **マルチプラットフォーム対応**: Twitter(X)、Zenn、Qiita
- **サムネイル表示**: 記事の視覚的プレビュー

### 🏷️ 分類・整理機能
- **ジャンル管理**: カラー付きカテゴリで記事を分類
- **タグシステム**: 柔軟なタグ付けによる詳細分類
- **階層的管理**: ジャンル + タグの組み合わせ

### 🔍 高度な検索
- **全文検索**: タイトル・内容・著者での包括的検索
- **フィルター機能**: プラットフォーム・ジャンル・タグによる絞り込み
- **リアルタイム検索**: 入力と同時に結果を表示

### 📱 モダンUI/UX
- **レスポンシブデザイン**: デスクトップ・タブレット・モバイル対応
- **ダークモード**: 目に優しい表示切り替え（予定）
- **直感的インターフェース**: ドラッグ&ドロップ操作（予定）

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/article-storage-app.git
cd article-storage-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成して以下の環境変数を設定：

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 4. データベースのセットアップ

```bash
# Prisma クライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev

# または既存のデータベースにプッシュ
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 🧪 テスト実行

```bash
# 全テストの実行
npm test

# テストの監視モード
npm run test:watch
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動  
npm start

# ESLint実行
npm run lint

# Prisma Studio（データベース管理）
npm run db:studio
```

## 📖 詳細なセットアップ

完全なセットアップ手順については、以下のドキュメントを参照してください：

- **[📋 セットアップガイド](./SETUP.md)** - データベースと認証の詳細設定
- **[🚀 デプロイメントガイド](./DEPLOYMENT.md)** - 本番環境へのデプロイ手順

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.3.4** - React フレームワーク（App Router）
- **React 19.0.0** - ユーザーインターフェース
- **TypeScript 5** - 型安全な開発
- **Tailwind CSS v4** - モダンCSSフレームワーク
- **Lucide React** - アイコンライブラリ
- **Radix UI** - 高品質コンポーネント

### バックエンド
- **NextAuth.js 4.24.11** - 認証システム
- **Prisma 5.18.0** - データベースORM
- **PostgreSQL** - メインデータベース
- **Cheerio** - サーバーサイドHTML解析

### 開発ツール
- **ESLint** - コード品質管理
- **Vitest 3.2.4** - 高速テストフレームワーク
- **React Testing Library** - コンポーネントテスト
- **PostCSS** - CSS後処理ツール
- **TypeScript** - 型安全な開発環境

## 📂 プロジェクト構成

```
article-storage-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js認証
│   │   ├── articles/      # 記事管理API
│   │   ├── genres/        # ジャンル管理API
│   │   └── tags/          # タグ管理API
│   ├── components/        # Reactコンポーネント
│   │   ├── ui/           # 再利用可能UIコンポーネント
│   │   └── ...           # フィーチャー固有コンポーネント
│   ├── dashboard/         # ダッシュボードページ
│   ├── globals.css        # Tailwind CSSグローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx          # ホームページ
├── lib/                   # ユーティリティ関数
│   ├── auth.ts           # NextAuth.js設定
│   ├── prisma.ts         # Prismaクライアント
│   ├── platform-detector.ts  # プラットフォーム判定
│   └── metadata-extractor.ts # メタデータ抽出
├── prisma/               # データベーススキーマ
│   ├── schema.prisma     # Prismaスキーマ定義
│   └── migrations/       # マイグレーションファイル
├── __tests__/            # Vitestテストファイル
├── CLAUDE.md            # Claude Code指示書
├── SETUP.md             # セットアップガイド
├── DEPLOYMENT.md        # デプロイメントガイド
└── README.md           # このファイル
```

## 🎯 使い方

### 1. 記事の追加

1. ダッシュボードの「記事管理」タブを選択
2. 記事URLを入力（Twitter、Zenn、Qiitaに対応）
3. 「記事を追加」ボタンをクリック
4. 自動的にメタデータが取得され、記事が保存されます

### 2. ジャンル・タグの管理

1. 「ジャンル管理」または「タグ管理」タブを選択
2. 「作成」ボタンで新しいジャンル/タグを追加
3. 名前、説明、カラー（ジャンルのみ）を設定

### 3. 記事の分類

1. 記事カードの「ジャンル」「タグ」セクションで「+ 追加」をクリック
2. 既存のジャンル/タグから選択して分類

### 4. 記事の検索

1. 検索バーにキーワードを入力
2. 「フィルター」ボタンで詳細な絞り込み条件を設定
3. プラットフォーム、ジャンル、タグで組み合わせ検索

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 開発の流れ

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

### 開発ガイドライン

- **ESLint** ルールに従ってコードを書く
- **TypeScript** の型安全性を保つ
- **コンポーネント** は再利用可能に設計
- **API** のエラーハンドリングを適切に実装

## 🐛 バグレポート・機能要求

問題を発見した場合や新機能の提案がある場合：

1. [Issues](https://github.com/your-username/article-storage-app/issues) を確認
2. 既存のissueがない場合、新しいissueを作成
3. バグの場合：再現手順、期待する動作、実際の動作を記載
4. 機能要求の場合：背景、提案する機能、期待する効果を記載

## 📊 ロードマップ

### Phase 1: MVP機能 ✅
- [x] 認証システム
- [x] 記事管理（追加・一覧・検索）
- [x] ジャンル・タグ機能
- [x] 基本検索機能

### Phase 2: 機能拡張（開発予定）
- [ ] ブックマーク・お気に入り機能
- [ ] 読了ステータス管理
- [ ] メモ機能
- [ ] 高度なフィルター
- [ ] 統計・ダッシュボード

### Phase 3: UX改善（検討中）
- [ ] ダークモード
- [ ] PWA対応
- [ ] キーボードショートカット
- [ ] ドラッグ&ドロップ操作
- [ ] エクスポート機能

## 📜 ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で公開されています。

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - 素晴らしいReactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - 効率的なスタイリング
- [Prisma](https://www.prisma.io/) - 型安全なORM
- [NextAuth.js](https://next-auth.js.org/) - 認証ソリューション

---

**📧 お問い合わせ**: プロジェクトに関する質問は [Issues](https://github.com/your-username/article-storage-app/issues) または [Discussions](https://github.com/your-username/article-storage-app/discussions) でお気軽にどうぞ！

**⭐ このプロジェクトが役に立ったら、ぜひスターをお願いします！**