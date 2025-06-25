#!/bin/bash

# Vercel + Neon 本番環境デプロイ後のデータベースマイグレーション実行スクリプト

set -e

echo "🚀 Vercel + Neon データベースマイグレーション開始"

# Vercel CLIのインストール確認
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLIがインストールされていません。インストールを実行します..."
    npm install -g vercel
fi

# Vercelログイン確認
echo "📝 Vercelにログインしています..."
vercel whoami || {
    echo "Vercelにログインしてください:"
    vercel login
}

# プロジェクトリンク確認
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Vercelプロジェクトをリンクします..."
    vercel link
fi

# 本番環境変数を取得
echo "⚡ 本番環境変数を取得中..."
vercel env pull .env.production --environment=production

# データベースURL確認（Neon用）
if ! grep -q "DATABASE_URL" .env.production; then
    echo "❌ エラー: DATABASE_URL が見つかりません"
    echo "Neonデータベース接続文字列が正しく設定されているか確認してください"
    echo "例: postgresql://user:pass@host/db?sslmode=require"
    exit 1
fi

# 環境変数読み込み
export $(cat .env.production | grep DATABASE_URL | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ エラー: DATABASE_URLが設定されていません"
    exit 1
fi

echo "🌐 接続先: $(echo $DATABASE_URL | sed 's/:[^:]*@/@***:***@/')"

# SSL接続確認
if [[ $DATABASE_URL != *"sslmode=require"* ]]; then
    echo "⚠️  警告: SSL接続が設定されていません"
    echo "Neonの場合はsslmode=requireの追加を推奨します"
fi

# データベース接続テスト
echo "🔍 Neonデータベース接続をテストしています..."
DATABASE_URL="$DATABASE_URL" npx prisma db push --accept-data-loss --skip-generate || {
    echo "❌ データベース接続に失敗しました"
    echo "🔧 トラブルシューティング:"
    echo "   1. Neon接続文字列が正しいか確認"
    echo "   2. sslmode=require が含まれているか確認"
    echo "   3. NeonコンソールでIPアクセス制限を確認"
    exit 1
}

# Prismaクライアント生成
echo "🔄 Prismaクライアントを生成中..."
npx prisma generate

# マイグレーション実行
echo "📊 Neonデータベースにマイグレーションを実行中..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

# マイグレーション状態確認
echo "✅ マイグレーション状態を確認中..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate status

# データベース情報表示
echo "📊 データベース情報:"
DATABASE_URL="$DATABASE_URL" npx prisma db execute --command "SELECT version();" 2>/dev/null || true

# Prisma Studio起動確認（オプション）
read -p "📱 Prisma StudioでNeonデータベースを確認しますか？ (y/N): " confirm
if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "🎯 Prisma Studioを起動中..."
    echo "⚠️  注意: 本番Neonデータベースに直接アクセスします"
    echo "🌐 ブラウザで http://localhost:5555 が開きます"
    DATABASE_URL="$DATABASE_URL" npx prisma studio
fi

# 一時ファイル削除
echo "🧹 一時ファイルをクリーンアップ中..."
rm -f .env.production

echo ""
echo "🎉 Neonマイグレーション完了！"
echo "📍 次の手順:"
echo "   1. ブラウザでアプリケーションにアクセス"
echo "   2. 認証機能をテスト（Google/GitHub）"  
echo "   3. 記事追加機能をテスト"
echo "   4. ジャンル・タグ管理をテスト"
echo "   5. 検索機能をテスト"
echo "   6. app/api/migrate/route.ts を削除（セキュリティのため）"
echo ""
echo "🔗 Neonコンソール: https://console.neon.tech/"
echo "📊 Vercelダッシュボード: https://vercel.com/dashboard"