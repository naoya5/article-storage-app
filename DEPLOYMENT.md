# デプロイメントガイド

このガイドでは、記事ストックアプリを本番環境にデプロイする手順を説明します。

## 🚀 Vercel へのデプロイ（推奨）

Vercel は Next.js アプリケーションに最適化されており、最も簡単にデプロイできます。

### 1. 前準備

- GitHub リポジトリにコードをプッシュ
- [Vercel アカウント](https://vercel.com/signup) を作成

### 2. Vercel でのプロジェクト作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「New Project」をクリック
3. GitHub リポジトリを選択
4. プロジェクト設定：
   - Framework: `Next.js`
   - Root Directory: `./`（デフォルト）
   - Build Command: `npm run build`（デフォルト）
   - Output Directory: `.next`（デフォルト）

### 3. 環境変数の設定

Vercel Dashboard で Settings → Environment Variables に移動し、以下を設定：

```bash
# データベース（Vercel Postgres 使用の場合は自動設定）
DATABASE_URL=postgresql://...

# NextAuth.js
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-production-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. データベースのセットアップ

#### Vercel Postgres を使用する場合：

1. Vercel Dashboard で Storage タブを選択
2. 「Create Database」→「Postgres」を選択
3. 自動的に `DATABASE_URL` 等が設定される
4. データベースマイグレーション実行：

```bash
# ローカルで実行（Vercel CLI使用）
vercel env pull .env.local
npx prisma migrate deploy
```

#### 外部データベースを使用する場合：

Supabase、Railway、PlanetScale等の接続情報を環境変数に設定

### 5. OAuth リダイレクト URI の更新

#### Google Cloud Console:
- 承認済みリダイレクト URI に追加: `https://your-app-name.vercel.app/api/auth/callback/google`

#### GitHub OAuth Settings:
- Authorization callback URL を更新: `https://your-app-name.vercel.app/api/auth/callback/github`

### 6. デプロイの実行

1. 「Deploy」ボタンをクリック
2. 数分待つとデプロイ完了
3. ドメインにアクセスして動作確認

## 🔧 Railway へのデプロイ

### 1. Railway プロジェクトの作成

1. [Railway](https://railway.app/) にアクセス
2. GitHub と連携
3. リポジトリを選択して「Deploy Now」

### 2. 環境変数の設定

Railway Dashboard で Variables タブから環境変数を設定

### 3. データベースの追加

1. 「New」→「Database」→「PostgreSQL」
2. 自動的に `DATABASE_URL` が設定される
3. マイグレーション実行

## 🌐 Netlify へのデプロイ

### 1. ビルド設定

`netlify.toml` をプロジェクトルートに作成：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. 環境変数とデプロイ

Netlify Dashboard で環境変数を設定後、GitHub連携でデプロイ

## 🐳 Docker でのデプロイ

### 1. Dockerfile の作成

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose（開発用）

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/article_storage_db
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: article_storage_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 🔄 CI/CD パイプライン

### GitHub Actions の例

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run lint
      run: npm run lint
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 📊 パフォーマンス最適化

### 1. Next.js 設定の最適化

`next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // 本番環境での最適化
  swcMinify: true,
  compress: true,
  
  // 画像最適化
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // ヘッダー設定
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
}
```

### 2. データベース最適化

```bash
# 本番環境でのマイグレーション
npx prisma migrate deploy

# データベース接続プールの設定
DATABASE_URL="postgresql://user:pass@host:port/db?connection_limit=10&pool_timeout=20"
```

## 🔒 セキュリティチェックリスト

### 本番環境デプロイ前の確認事項：

- [ ] `NEXTAUTH_SECRET` が強力なランダム値に設定されている
- [ ] `NEXTAUTH_URL` が正しい本番ドメインに設定されている
- [ ] OAuth リダイレクト URI が正しく設定されている
- [ ] データベース接続が SSL を使用している
- [ ] 環境変数がソースコードに含まれていない
- [ ] `.env.local` が `.gitignore` に追加されている
- [ ] CSP（Content Security Policy）が設定されている
- [ ] HTTPS が有効になっている

## 📈 監視とメンテナンス

### 1. ログ監視

Vercel の場合：
- Functions タブでサーバーログを確認
- Real-time logs で動作監視

### 2. パフォーマンス監視

- Vercel Analytics でページ表示速度を監視
- Core Web Vitals の改善

### 3. エラー追跡

Sentry 統合の例：

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 🆘 トラブルシューティング

### よくある問題と解決方法：

**ビルドエラー**:
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

**データベース接続エラー**:
- SSL設定の確認
- 接続文字列の検証
- ファイアウォール設定の確認

**OAuth エラー**:
- リダイレクト URI の再確認
- ドメイン設定の検証

## 📋 デプロイ後のチェックリスト

- [ ] アプリケーションが正常に起動する
- [ ] 認証（Google/GitHub）が動作する
- [ ] 記事追加機能が動作する
- [ ] 検索機能が動作する
- [ ] レスポンシブデザインが正しく表示される
- [ ] データベースへの接続が正常
- [ ] SSL証明書が有効
- [ ] パフォーマンスが acceptable range 内

---

**関連ドキュメント**: 
- [セットアップガイド](./SETUP.md)
- [開発ガイド](./README.md)