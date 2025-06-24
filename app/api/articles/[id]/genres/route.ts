import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: { id: string }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { genreId } = await request.json()

    if (!genreId || typeof genreId !== 'string') {
      return NextResponse.json(
        { error: "ジャンルIDが必要です" },
        { status: 400 }
      )
    }

    // 記事の存在確認と所有者チェック
    const article = await prisma.article.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: "記事が見つかりません" },
        { status: 404 }
      )
    }

    // ジャンルの存在確認と所有者チェック
    const genre = await prisma.genre.findFirst({
      where: {
        id: genreId,
        userId: session.user.id
      }
    })

    if (!genre) {
      return NextResponse.json(
        { error: "ジャンルが見つかりません" },
        { status: 404 }
      )
    }

    // 既に関連付けられているかチェック
    const existingRelation = await prisma.articleGenre.findUnique({
      where: {
        articleId_genreId: {
          articleId: params.id,
          genreId: genreId
        }
      }
    })

    if (existingRelation) {
      return NextResponse.json(
        { error: "この記事には既にそのジャンルが付与されています" },
        { status: 409 }
      )
    }

    const articleGenre = await prisma.articleGenre.create({
      data: {
        articleId: params.id,
        genreId: genreId
      },
      include: {
        genre: true
      }
    })

    return NextResponse.json({
      message: "ジャンルが正常に付与されました",
      articleGenre: {
        id: articleGenre.id,
        genreId: articleGenre.genreId,
        genre: {
          id: articleGenre.genre.id,
          name: articleGenre.genre.name,
          color: articleGenre.genre.color
        }
      }
    })

  } catch (error) {
    console.error('Error adding genre to article:', error)
    return NextResponse.json(
      { error: "ジャンルの付与に失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { genreId } = await request.json()

    if (!genreId || typeof genreId !== 'string') {
      return NextResponse.json(
        { error: "ジャンルIDが必要です" },
        { status: 400 }
      )
    }

    // 記事の存在確認と所有者チェック
    const article = await prisma.article.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: "記事が見つかりません" },
        { status: 404 }
      )
    }

    // 関連付けの存在確認
    const existingRelation = await prisma.articleGenre.findUnique({
      where: {
        articleId_genreId: {
          articleId: params.id,
          genreId: genreId
        }
      }
    })

    if (!existingRelation) {
      return NextResponse.json(
        { error: "この記事にそのジャンルは付与されていません" },
        { status: 404 }
      )
    }

    await prisma.articleGenre.delete({
      where: {
        articleId_genreId: {
          articleId: params.id,
          genreId: genreId
        }
      }
    })

    return NextResponse.json({
      message: "ジャンルが正常に削除されました"
    })

  } catch (error) {
    console.error('Error removing genre from article:', error)
    return NextResponse.json(
      { error: "ジャンルの削除に失敗しました" },
      { status: 500 }
    )
  }
}