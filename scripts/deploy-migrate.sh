#!/bin/bash

# Vercel本番環境デプロイ後のデータベースマイグレーション実行スクリプト

set -e

echo "🚀 Vercel本番環境データベースマイグレーション開始"

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

# データベースURL確認
if ! grep -q "POSTGRES_PRISMA_URL" .env.production; then
    echo "❌ エラー: POSTGRES_PRISMA_URL が見つかりません"
    echo "Vercel Postgresデータベースが正しく設定されているか確認してください"
    exit 1
fi

# 環境変数読み込み
export $(cat .env.production | grep POSTGRES_PRISMA_URL | xargs)

if [ -z "$POSTGRES_PRISMA_URL" ]; then
    echo "❌ エラー: DATABASE_URLが設定されていません"
    exit 1
fi

# データベース接続テスト
echo "🔍 データベース接続をテストしています..."
DATABASE_URL="$POSTGRES_PRISMA_URL" npx prisma db push --accept-data-loss --skip-generate || {
    echo "❌ データベース接続に失敗しました"
    exit 1
}

# Prismaクライアント生成
echo "🔄 Prismaクライアントを生成中..."
npx prisma generate

# マイグレーション実行
echo "📊 データベースマイグレーションを実行中..."
DATABASE_URL="$POSTGRES_PRISMA_URL" npx prisma migrate deploy

# マイグレーション状態確認
echo "✅ マイグレーション状態を確認中..."
DATABASE_URL="$POSTGRES_PRISMA_URL" npx prisma migrate status

# Prisma Studio起動確認（オプション）
read -p "📱 Prisma Studioで本番データベースを確認しますか？ (y/N): " confirm
if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "🎯 Prisma Studioを起動中..."
    echo "⚠️  注意: 本番データベースに直接アクセスします"
    DATABASE_URL="$POSTGRES_PRISMA_URL" npx prisma studio
fi

# 一時ファイル削除
echo "🧹 一時ファイルをクリーンアップ中..."
rm -f .env.production

echo "🎉 マイグレーション完了！"
echo "📍 次の手順:"
echo "   1. ブラウザでアプリケーションにアクセス"
echo "   2. 認証機能をテスト"  
echo "   3. 記事追加機能をテスト"
echo "   4. app/api/migrate/route.ts を削除（セキュリティのため）"