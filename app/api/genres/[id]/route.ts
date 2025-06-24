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

    const { name, description, color } = await request.json()

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

    // ジャンルの存在確認と所有者チェック
    const existingGenre = await prisma.genre.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingGenre) {
      return NextResponse.json(
        { error: "ジャンルが見つかりません" },
        { status: 404 }
      )
    }

    // 同じ名前の他のジャンルの存在確認
    const duplicateGenre = await prisma.genre.findFirst({
      where: {
        name: name.trim(),
        userId: session.user.id,
        id: { not: params.id }
      }
    })

    if (duplicateGenre) {
      return NextResponse.json(
        { error: "同じ名前のジャンルが既に存在します" },
        { status: 409 }
      )
    }

    const updatedGenre = await prisma.genre.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
      },
    })

    return NextResponse.json({
      message: "ジャンルが正常に更新されました",
      genre: {
        id: updatedGenre.id,
        name: updatedGenre.name,
        description: updatedGenre.description,
        color: updatedGenre.color,
        updatedAt: updatedGenre.updatedAt,
      }
    })

  } catch (error) {
    console.error('Error updating genre:', error)
    return NextResponse.json(
      { error: "ジャンルの更新に失敗しました" },
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

    // ジャンルの存在確認と所有者チェック
    const existingGenre = await prisma.genre.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        articleGenres: true
      }
    })

    if (!existingGenre) {
      return NextResponse.json(
        { error: "ジャンルが見つかりません" },
        { status: 404 }
      )
    }

    // 関連する記事がある場合の確認
    if (existingGenre.articleGenres.length > 0) {
      return NextResponse.json(
        { error: "このジャンルには記事が関連付けられているため削除できません" },
        { status: 400 }
      )
    }

    await prisma.genre.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: "ジャンルが正常に削除されました"
    })

  } catch (error) {
    console.error('Error deleting genre:', error)
    return NextResponse.json(
      { error: "ジャンルの削除に失敗しました" },
      { status: 500 }
    )
  }
}