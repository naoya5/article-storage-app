import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ⚠️ セキュリティ注意: このエンドポイントは本番マイグレーション後に削除してください
export async function POST(request: Request) {
  try {
    // 簡単なセキュリティトークンチェック
    const { token } = await request.json()
    
    if (token !== process.env.MIGRATION_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Prisma migrate deploy を実行
    // 注意: 本来はCLIでの実行が推奨されますが、初回デプロイ時の便宜的措置
    
    console.log("Starting database migration...")
    
    // データベース接続テスト
    await prisma.$connect()
    console.log("Database connection successful")
    
    // 既存のテーブルを確認
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    console.log("Existing tables:", tables)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: "Database connection verified. Please run 'npx prisma migrate deploy' locally with production DATABASE_URL.",
      tables
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        error: "Migration failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// データベース状態確認用（GET）
export async function GET() {
  try {
    await prisma.$connect()
    
    // テーブル一覧を取得
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: "Database connected",
      tables
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}