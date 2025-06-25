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

    // Neonデータベース接続テスト
    console.log("Starting Neon database connection test...")
    
    // データベース接続テスト
    await prisma.$connect()
    console.log("Neon database connection successful")
    
    // PostgreSQLバージョン確認
    const version = await prisma.$queryRaw`SELECT version() as version`
    console.log("Database version:", version)
    
    // 既存のテーブルを確認
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    console.log("Existing tables:", tables)
    
    // 接続情報確認（パスワードを隠して表示）
    const connectionInfo = process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@') || 'Not set'
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: "Neon database connection verified. Please run 'npm run deploy:migrate' locally to execute migrations.",
      database: "Neon PostgreSQL",
      connectionInfo,
      version,
      tables
    })

  } catch (error) {
    console.error('Neon connection error:', error)
    return NextResponse.json(
      { 
        error: "Neon database connection failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        troubleshooting: [
          "1. Check DATABASE_URL format: postgresql://user:pass@host/db?sslmode=require",
          "2. Verify Neon database is active",
          "3. Check IP access restrictions in Neon console"
        ]
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