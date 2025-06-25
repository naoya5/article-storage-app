# 🚀 Vercel デプロイ実行手順

このファイルは実際のデプロイ作業で使用する手順書です。

## ステップ1: OAuth設定更新（本番URL対応）

### Google OAuth設定更新

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト選択 → 「APIとサービス」→「認証情報」
3. 既存のOAuthクライアントIDを選択
4. 「承認済みリダイレクトURI」に追加：
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```
   ⚠️ `your-project-name` は実際のVercelプロジェクト名に置き換え

### GitHub OAuth設定更新

1. GitHub → Settings → Developer settings → OAuth Apps
2. 既存アプリケーションを選択
3. 設定を更新：
   - Homepage URL: `https://your-project-name.vercel.app`
   - Authorization callback URL: `https://your-project-name.vercel.app/api/auth/callback/github`

## ステップ2: Vercel環境変数設定

Vercel Dashboard → Settings → Environment Variables で以下を設定：

```bash
# NextAuth.js設定
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-super-secure-production-secret

# データベース（Vercel Postgresで自動設定済み）
DATABASE_URL=${POSTGRES_PRISMA_URL}

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### NEXTAUTH_SECRET生成方法

本番環境用の強力なシークレットを生成：

```bash
# ターミナルで実行
openssl rand -base64 32
```

または：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## ステップ3: デプロイ実行

1. Vercel Dashboard → Deployments
2. **「Deploy」ボタンをクリック**
3. ビルドログを確認（3-5分程度）

## ステップ4: データベースマイグレーション

デプロイ成功後、本番データベースにマイグレーションを適用：

### 方法1: Vercel CLIを使用（推奨）

```bash
# Vercel CLI インストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトをリンク
vercel link

# 本番環境変数をローカルに取得
vercel env pull .env.production

# 本番データベースにマイグレーション実行
DATABASE_URL=$(cat .env.production | grep POSTGRES_PRISMA_URL | cut -d'=' -f2) npx prisma migrate deploy
```

### 方法2: Vercel Function経由（代替方法）

一時的なマイグレーション用APIエンドポイントを作成する場合：

1. `app/api/migrate/route.ts` を作成（セキュリティ注意）
2. デプロイ後に一度だけアクセス
3. マイグレーション完了後、ファイルを削除

## ステップ5: 動作確認

デプロイしたアプリケーションで以下を確認：

- [ ] サイトにアクセスできる
- [ ] Google認証が動作する  
- [ ] GitHub認証が動作する
- [ ] 記事追加機能が動作する
- [ ] 検索機能が動作する
- [ ] ジャンル・タグ管理が動作する

## ステップ6: セキュリティ最終確認

- [ ] 本番用の強力なNEXTAUTH_SECRETを設定済み
- [ ] OAuth設定で本番URLのみ許可済み
- [ ] データベース接続がSSL使用
- [ ] 環境変数がソースコードに含まれていない

## トラブルシューティング

### ビルドエラー

```bash
# 型エラーの場合
npx tsc --noEmit

# ESLintエラーの場合  
npm run lint
```

### データベース接続エラー

- Vercel Postgres の接続情報を確認
- `DATABASE_URL` が `POSTGRES_PRISMA_URL` に設定されているか確認

### OAuth認証エラー

- リダイレクトURIが正確に設定されているか確認
- `NEXTAUTH_URL` が正しいドメインになっているか確認

## 完了後の次のステップ

1. カスタムドメインの設定（任意）
2. パフォーマンス監視の設定
3. エラー追跡（Sentry等）の統合
4. 定期バックアップの設定

---

🎉 **デプロイ完了おめでとうございます！** 

記事ストックアプリが本番環境で利用可能になりました。