import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "タグ名が必要です" },
        { status: 400 }
      )
    }

    if (name.trim().length > 30) {
      return NextResponse.json(
        { error: "タグ名は30文字以内で入力してください" },
        { status: 400 }
      )
    }

    // タグの存在確認と所有者チェック
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: "タグが見つかりません" },
        { status: 404 }
      )
    }

    // 同じ名前の他のタグの存在確認
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
        userId: session.user.id,
        id: { not: params.id }
      }
    })

    if (duplicateTag) {
      return NextResponse.json(
        { error: "同じ名前のタグが既に存在します" },
        { status: 409 }
      )
    }

    const updatedTag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
      },
    })

    return NextResponse.json({
      message: "タグが正常に更新されました",
      tag: {
        id: updatedTag.id,
        name: updatedTag.name,
        updatedAt: updatedTag.updatedAt,
      }
    })

  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { error: "タグの更新に失敗しました" },
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

    // タグの存在確認と所有者チェック
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        articleTags: true
      }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: "タグが見つかりません" },
        { status: 404 }
      )
    }

    // 関連する記事がある場合の確認
    if (existingTag.articleTags.length > 0) {
      return NextResponse.json(
        { error: "このタグには記事が関連付けられているため削除できません" },
        { status: 400 }
      )
    }

    await prisma.tag.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: "タグが正常に削除されました"
    })

  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: "タグの削除に失敗しました" },
      { status: 500 }
    )
  }
}