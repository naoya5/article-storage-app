# 🚀 Vercel + Neon デプロイガイド

最新の推奨構成でのデプロイ手順です。

## 🌟 Neonを選ぶ理由

- **サーバーレスPostgreSQL**: 自動スケーリング・コールドスタート対応
- **ブランチング機能**: 開発・ステージング・本番環境の分離
- **無料プラン充実**: 月500MB、10万行まで無料
- **Vercel公式連携**: シームレスな統合
- **高性能**: エッジでの最適化

## 📋 デプロイ手順

### 1️⃣ Neonデータベース作成

1. **[Neon Console](https://console.neon.tech/) にアクセス**
2. **GitHubアカウントでサインアップ/ログイン**
3. **「Create Project」をクリック**
4. プロジェクト設定：
   - **Project name**: `article-storage-app`
   - **Database name**: `article_storage_db`
   - **Region**: `Asia Pacific (Tokyo)` (ap-southeast-1)
   - **PostgreSQL version**: `16` (最新推奨)

5. **「Create Project」をクリック**

### 2️⃣ 接続情報の取得

プロジェクト作成後、Neon Dashboard で：

1. **「Quickstart」または「Connection Details」を確認**
2. **接続文字列をコピー**：
   ```
   postgresql://username:password@hostname/dbname?sslmode=require
   ```

例:
```
postgresql://article_storage_app_owner:abc123@ep-cool-tree-12345.ap-southeast-1.aws.neon.tech/article_storage_app?sslmode=require
```

### 3️⃣ Vercelプロジェクト作成

1. **[Vercel Dashboard](https://vercel.com/dashboard) にアクセス**
2. **「New Project」→ GitHubリポジトリ `article-storage-app` を選択**
3. **プロジェクト設定確認**：
   - Framework: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **⚠️ まだ「Deploy」はクリックしない**

### 4️⃣ Vercel環境変数設定

**Settings → Environment Variables** で以下を追加：

```bash
# データベース接続
DATABASE_URL=postgresql://username:password@hostname/dbname?sslmode=require

# NextAuth.js設定
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-super-secure-secret

# Google OAuth（開発環境と同じ値）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth（開発環境と同じ値）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 5️⃣ NEXTAUTH_SECRET生成

```bash
# ターミナルで実行
openssl rand -base64 32
```

生成された文字列をコピーして `NEXTAUTH_SECRET` に設定

### 6️⃣ OAuth設定更新

#### Google OAuth設定:
1. [Google Cloud Console](https://console.cloud.google.com/) → APIとサービス → 認証情報
2. OAuthクライアントIDを選択
3. **承認済みリダイレクトURI** に追加：
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```

#### GitHub OAuth設定:
1. GitHub → Settings → Developer settings → OAuth Apps
2. 既存アプリケーションを選択
3. 設定を更新：
   - **Homepage URL**: `https://your-project-name.vercel.app`
   - **Authorization callback URL**: `https://your-project-name.vercel.app/api/auth/callback/github`

### 7️⃣ Vercelデプロイ実行

1. **Vercel Dashboard → 「Deploy」ボタンをクリック**
2. **ビルドログを確認（3-5分待機）**
3. **デプロイ成功を確認**

### 8️⃣ データベースマイグレーション

デプロイ成功後、ローカルで実行：

#### 方法1: 自動スクリプト使用（推奨）

```bash
# Neon接続情報を使用してマイグレーション
DATABASE_URL="postgresql://username:password@hostname/dbname?sslmode=require" npx prisma migrate deploy
```

#### 方法2: Vercel CLI使用

```bash
# Vercel CLI インストール・ログイン
npm i -g vercel
vercel login
vercel link

# 本番環境変数取得
vercel env pull .env.production

# マイグレーション実行
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d'=' -f2) npx prisma migrate deploy

# 一時ファイル削除
rm .env.production
```

### 9️⃣ マイグレーション確認

```bash
# Prisma Studio で本番データベース確認
DATABASE_URL="your-neon-connection-string" npx prisma studio
```

## 🔧 Neon固有の最適化

### 接続プール設定

本番環境でのパフォーマンス向上のため、接続文字列にプール設定を追加：

```bash
DATABASE_URL="postgresql://username:password@hostname/dbname?sslmode=require&pgbouncer=true&connect_timeout=15"
```

### ブランチ機能活用（オプション）

Neonのブランチ機能で開発・ステージング環境を作成：

1. **Neon Console → Branches → 「Create Branch」**
2. **Branch name**: `staging` or `development`
3. **各環境用の接続文字列を取得**

## 🛡️ セキュリティ設定

### Neon側設定:
1. **IP制限**: 必要に応じてVercelのIPレンジを許可
2. **SSL強制**: `sslmode=require` が設定されていることを確認

### アプリケーション側:
1. **マイグレーションAPI削除**:
   ```bash
   rm app/api/migrate/route.ts
   git add . && git commit -m "remove migration API"
   ```

## 🚀 動作確認チェックリスト

デプロイ完了後、以下を確認：

- [ ] **ホームページ表示**: `https://your-app.vercel.app`
- [ ] **Google認証**: ログイン・ログアウト
- [ ] **GitHub認証**: ログイン・ログアウト  
- [ ] **記事追加**: TwitterやZennのURL追加
- [ ] **ジャンル管理**: 作成・編集・削除
- [ ] **タグ管理**: 作成・編集・削除
- [ ] **検索機能**: キーワード・フィルター検索
- [ ] **記事分類**: ジャンル・タグの付与・削除

## 📊 Neonダッシュボード活用

### 監視機能:
- **Metrics**: CPU・メモリ・接続数の監視
- **Query Performance**: スロークエリの特定
- **Branches**: 環境別の使用状況

### バックアップ:
- **Point-in-time Recovery**: 自動バックアップ（7日間保持）
- **Manual Snapshots**: 手動バックアップ作成

## 🆘 トラブルシューティング

### よくある問題:

**接続エラー**: 
```bash
# SSL設定確認
DATABASE_URL="...?sslmode=require"
```

**タイムアウトエラー**:
```bash
# 接続タイムアウト設定
DATABASE_URL="...?connect_timeout=15"
```

**マイグレーションエラー**:
```bash
# Prismaキャッシュクリア
npx prisma generate
```

## 💰 料金について

### Neon無料プラン:
- **ストレージ**: 500MB
- **コンピュート時間**: 191.9時間/月
- **データベース**: 1個
- **ブランチ**: 10個

プロダクション利用には **Pro Plan** ($19/月) 推奨

---

**🎉 これでVercel + Neonデプロイの準備が完了です！**

次のステップを実行してアプリケーションを本番環境にデプロイしましょう。