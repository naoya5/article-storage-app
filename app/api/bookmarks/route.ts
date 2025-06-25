import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const { articleId } = await request.json()

    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json(
        { error: "記事IDが必要です" },
        { status: 400 }
      )
    }

    // 既存のブックマークをチェック
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId: session.user.id
        }
      }
    })

    if (existingBookmark) {
      return NextResponse.json(
        { error: "既にブックマークされています" },
        { status: 409 }
      )
    }

    // ブックマークを作成
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        articleId
      }
    })

    return NextResponse.json({
      message: "ブックマークに追加しました",
      bookmark: {
        id: bookmark.id,
        createdAt: bookmark.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: "ブックマークの追加に失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json(
        { error: "記事IDが必要です" },
        { status: 400 }
      )
    }

    // ブックマークの存在確認
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId: session.user.id
        }
      }
    })

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "ブックマークが見つかりません" },
        { status: 404 }
      )
    }

    // ブックマークを削除
    await prisma.bookmark.delete({
      where: {
        id: existingBookmark.id
      }
    })

    return NextResponse.json({
      message: "ブックマークを削除しました"
    })

  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: "ブックマークの削除に失敗しました" },
      { status: 500 }
    )
  }
}