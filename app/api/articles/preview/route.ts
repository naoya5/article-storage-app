import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { detectPlatform, isValidUrl, isSupportedPlatform } from "@/lib/platform-detector"
import { extractMetadata } from "@/lib/metadata-extractor"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: "URLが必要です" },
        { status: 400 }
      )
    }

    // URL形式チェック
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "有効なURLを入力してください" },
        { status: 400 }
      )
    }

    // サポート対象プラットフォームチェック
    if (!isSupportedPlatform(url)) {
      return NextResponse.json(
        { error: "サポートされていないプラットフォームです（Twitter、Zenn、Qiitaのみ対応）" },
        { status: 400 }
      )
    }

    // プラットフォーム判別
    const platform = detectPlatform(url)
    if (!platform) {
      return NextResponse.json(
        { error: "プラットフォームの判別に失敗しました" },
        { status: 400 }
      )
    }

    // メタデータ取得（データベースには保存しない）
    const metadata = await extractMetadata(url)

    // プレビュー用の記事データを返す
    return NextResponse.json({
      article: {
        title: metadata.title,
        description: metadata.description,
        url: url,
        author: metadata.author,
        platform: platform,
        publishedAt: metadata.publishedAt,
        imageUrl: metadata.thumbnail,
      }
    })

  } catch (error) {
    console.error('Error fetching article preview:', error)
    return NextResponse.json(
      { error: "記事のプレビュー取得に失敗しました" },
      { status: 500 }
    )
  }
}