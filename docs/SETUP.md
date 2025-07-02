# セットアップガイド

このドキュメントでは、記事ストックアプリの開発環境・本番環境のセットアップ手順を説明します。

## 📋 前提条件

- Node.js 18.0.0 以上
- npm または yarn
- PostgreSQL データベース
- Google Cloud Platform アカウント（Google認証用）
- GitHub アカウント（GitHub認証用）

## 🗄️ データベースセットアップ

### 1. PostgreSQL のインストール

#### macOS (Homebrew使用)
```bash
brew install postgresql
brew services start postgresql
```

#### Docker を使用する場合
```bash
# PostgreSQL コンテナを起動
docker run --name article-storage-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=article_storage_db \
  -p 5432:5432 \
  -d postgres:15

# データベースが起動したことを確認
docker ps
```

#### クラウドデータベース（推奨）

**Supabase を使用する場合:**
1. [Supabase](https://supabase.com/) にアクセス
2. 新しいプロジェクトを作成
3. Settings > Database から接続文字列を取得

**Vercel Postgres を使用する場合:**
1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. Storage タブから Postgres データベースを作成
3. 接続詳細をコピー

**Railway を使用する場合:**
1. [Railway](https://railway.app/) にアクセス
2. 新しいプロジェクトで PostgreSQL を追加
3. データベース URL を取得

### 2. データベース URL の形式

```
postgresql://username:password@hostname:port/database_name
```

例:
```
postgresql://postgres:mypassword@localhost:5432/article_storage_db
```

## 🔐 認証プロバイダーの設定

### Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuthクライアントID」を選択
5. アプリケーションタイプ：「ウェブアプリケーション」
6. 承認済みリダイレクトURI：
   - 開発環境: `http://localhost:3000/api/auth/callback/google`
   - 本番環境: `https://yourdomain.com/api/auth/callback/google`
7. クライアントIDとクライアントシークレットをコピー

### GitHub OAuth 設定

1. GitHub にログイン
2. Settings → Developer settings → OAuth Apps に移動
3. 「New OAuth App」をクリック
4. アプリケーション情報を入力：
   - Application name: `Article Storage App`
   - Homepage URL: 
     - 開発環境: `http://localhost:3000`
     - 本番環境: `https://yourdomain.com`
   - Authorization callback URL:
     - 開発環境: `http://localhost:3000/api/auth/callback/github`
     - 本番環境: `https://yourdomain.com/api/auth/callback/github`
5. 「Register application」をクリック
6. Client IDとClient secretをコピー

## ⚙️ 環境変数設定

### 1. 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成：

```bash
cp .env.example .env.local
```

### 2. 環境変数の設定

`.env.local` ファイルに以下の値を設定：

```bash
# データベース接続URL
DATABASE_URL="postgresql://username:password@hostname:port/database_name"

# NextAuth.js 設定
NEXTAUTH_URL="http://localhost:3000"  # 本番環境では実際のURLに変更
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Google OAuth 認証情報
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth 認証情報
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. NextAuth Secret の生成

セキュアなランダム文字列を生成：

```bash
# OpenSSL を使用（推奨）
openssl rand -base64 32

# または Node.js を使用
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 アプリケーションのセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. データベースマイグレーション

```bash
# Prisma クライアントの生成
npx prisma generate

# データベースマイグレーション実行
npx prisma migrate deploy

# データベースの状態確認
npx prisma studio
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスして動作確認

## 🔧 トラブルシューティング

### データベース接続エラー

**エラー**: `Can't reach database server`

**解決方法**:
1. データベースサーバーが起動しているか確認
2. `DATABASE_URL` の値が正しいか確認
3. ファイアウォール設定の確認
4. SSL 接続が必要な場合は URL に `?sslmode=require` を追加

### 認証エラー

**エラー**: OAuth redirect URI mismatch

**解決方法**:
1. Google/GitHub の設定でリダイレクトURIが正しいか確認
2. `NEXTAUTH_URL` が正しいドメインに設定されているか確認
3. HTTPS を使用している場合、すべてのURLがHTTPSになっているか確認

### 環境変数が読み込まれない

**解決方法**:
1. ファイル名が `.env.local` になっているか確認
2. 変数名にスペースが含まれていないか確認
3. 開発サーバーを再起動

### マイグレーションエラー

**エラー**: Prisma migration failed

**解決方法**:
```bash
# マイグレーション状態をリセット
npx prisma migrate reset

# 新しくマイグレーション実行
npx prisma migrate dev
```

## 📁 ファイル構成

```
.
├── .env.local          # 環境変数（gitignore対象）
├── .env.example        # 環境変数テンプレート
├── prisma/
│   ├── schema.prisma   # データベーススキーマ
│   └── migrations/     # マイグレーションファイル
├── lib/
│   ├── auth.ts         # NextAuth.js設定
│   └── prisma.ts       # Prismaクライアント
└── app/
    └── api/auth/       # 認証API
```

## 🔒 セキュリティ注意事項

1. **本番環境では必ず**:
   - 強力な `NEXTAUTH_SECRET` を設定
   - `NEXTAUTH_URL` を実際のドメインに設定
   - データベース接続にSSLを使用
   - 環境変数をソースコードにコミットしない

2. **OAuth設定**:
   - 本番環境のリダイレクトURIのみを登録
   - 不要な権限スコープは要求しない

3. **データベース**:
   - 本番環境では専用ユーザーを作成
   - 最小限の権限のみを付与
   - 定期的なバックアップを設定

## 🌟 おすすめのホスティングサービス

### フロントエンド
- **Vercel**（推奨）: Next.js に最適化
- **Netlify**: 自動デプロイ機能
- **Railway**: フルスタック対応

### データベース
- **Supabase**（推奨）: PostgreSQL + 追加機能
- **PlanetScale**: MySQL互換
- **Railway Postgres**: 簡単セットアップ

## 📞 サポート

セットアップで問題が発生した場合：

1. このドキュメントのトラブルシューティングを確認
2. [プロジェクトのIssues](https://github.com/your-repo/issues) を検索
3. 新しいIssueを作成（エラーメッセージと環境情報を含める）

---

**次のステップ**: [デプロイメントガイド](./DEPLOYMENT.md) でアプリケーションを本番環境にデプロイする方法を確認してください。