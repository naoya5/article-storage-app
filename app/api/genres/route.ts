import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const genres = await prisma.genre.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
      include: {
        articleGenres: {
          include: { article: true }
        }
      }
    })

    const genresWithCount = genres.map(genre => ({
      ...genre,
      articleCount: genre.articleGenres.length
    }))

    return NextResponse.json({ genres: genresWithCount })

  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json(
      { error: "ジャンルの取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { name, color } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "ジャンル名が必要です" },
        { status: 400 }
      )
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "ジャンル名は50文字以内で入力してください" },
        { status: 400 }
      )
    }

    // 重複チェック
    const existingGenre = await prisma.genre.findFirst({
      where: {
        name: name.trim(),
        userId: session.user.id
      }
    })

    if (existingGenre) {
      return NextResponse.json(
        { error: "同じ名前のジャンルが既に存在します" },
        { status: 409 }
      )
    }

    const genre = await prisma.genre.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: "ジャンルが正常に作成されました",
      genre: {
        id: genre.id,
        name: genre.name,
        color: genre.color,
        createdAt: genre.createdAt,
      }
    })

  } catch (error) {
    console.error('Error creating genre:', error)
    return NextResponse.json(
      { error: "ジャンルの作成に失敗しました" },
      { status: 500 }
    )
  }
}