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

    const { tagId } = await request.json()

    if (!tagId || typeof tagId !== 'string') {
      return NextResponse.json(
        { error: "タグIDが必要です" },
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

    // タグの存在確認と所有者チェック
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: "タグが見つかりません" },
        { status: 404 }
      )
    }

    // 既に関連付けられているかチェック
    const existingRelation = await prisma.articleTag.findFirst({
      where: {
        articleId: params.id,
        tagId: tagId
      }
    })

    if (existingRelation) {
      return NextResponse.json(
        { error: "このタグは既に記事に付与されています" },
        { status: 409 }
      )
    }

    // 関連付けを作成
    await prisma.articleTag.create({
      data: {
        articleId: params.id,
        tagId: tagId
      }
    })

    return NextResponse.json({
      message: "タグが正常に記事に付与されました"
    })

  } catch (error) {
    console.error('Error adding tag to article:', error)
    return NextResponse.json(
      { error: "タグの付与に失敗しました" },
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

    const { tagId } = await request.json()

    if (!tagId || typeof tagId !== 'string') {
      return NextResponse.json(
        { error: "タグIDが必要です" },
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
    const existingRelation = await prisma.articleTag.findFirst({
      where: {
        articleId: params.id,
        tagId: tagId
      }
    })

    if (!existingRelation) {
      return NextResponse.json(
        { error: "この記事にタグが付与されていません" },
        { status: 404 }
      )
    }

    // 関連付けを削除
    await prisma.articleTag.delete({
      where: {
        articleId_tagId: {
          articleId: params.id,
          tagId: tagId
        }
      }
    })

    return NextResponse.json({
      message: "タグが正常に記事から削除されました"
    })

  } catch (error) {
    console.error('Error removing tag from article:', error)
    return NextResponse.json(
      { error: "タグの削除に失敗しました" },
      { status: 500 }
    )
  }
}