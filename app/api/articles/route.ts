import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { detectPlatform, isValidUrl, isSupportedPlatform } from "@/lib/platform-detector"
import { extractMetadata } from "@/lib/metadata-extractor"
import { Platform } from "@prisma/client"

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

    // 重複チェック
    const existingArticle = await prisma.article.findUnique({
      where: { url }
    })

    if (existingArticle) {
      return NextResponse.json(
        { error: "この記事は既に登録されています" },
        { status: 409 }
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

    // メタデータ取得
    const metadata = await extractMetadata(url)

    // 記事をデータベースに保存
    const article = await prisma.article.create({
      data: {
        url,
        title: metadata.title,
        description: metadata.description,
        author: metadata.author,
        publishedAt: metadata.publishedAt,
        platform,
        thumbnail: metadata.thumbnail,
        content: metadata.content,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: "記事が正常に追加されました",
      article: {
        id: article.id,
        title: article.title,
        url: article.url,
        platform: article.platform,
        createdAt: article.createdAt,
      }
    })

  } catch (error) {
    console.error('Error adding article:', error)
    return NextResponse.json(
      { error: "記事の追加に失敗しました" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform')
    const query = searchParams.get('query')
    const genreId = searchParams.get('genreId')
    const tagId = searchParams.get('tagId')

    const skip = (page - 1) * limit

    const where = {
      userId: session.user.id,
      ...(platform && { platform: platform as Platform }),
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
          { content: { contains: query, mode: 'insensitive' as const } },
          { author: { contains: query, mode: 'insensitive' as const } }
        ]
      }),
      ...(genreId && {
        articleGenres: {
          some: { genreId }
        }
      }),
      ...(tagId && {
        articleTags: {
          some: { tagId }
        }
      })
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          articleGenres: {
            include: { genre: true }
          },
          articleTags: {
            include: { tag: true }
          },
          bookmarks: {
            where: { userId: session.user.id }
          }
        }
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: "記事の取得に失敗しました" },
      { status: 500 }
    )
  }
}