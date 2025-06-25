import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ReadStatus } from "@prisma/client"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const { readStatus, isFavorite, rating, memo } = await request.json()

    // バリデーション
    if (readStatus && !Object.values(ReadStatus).includes(readStatus)) {
      return NextResponse.json(
        { error: "無効な読書ステータスです" },
        { status: 400 }
      )
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "評価は1-5の範囲で入力してください" },
        { status: 400 }
      )
    }

    // ブックマークの存在確認
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        id: resolvedParams.id,
        userId: session.user.id
      }
    })

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "ブックマークが見つかりません" },
        { status: 404 }
      )
    }

    // ブックマーク更新
    const updateData: {
      readStatus?: ReadStatus
      isFavorite?: boolean
      rating?: number | null
      memo?: string | null
    } = {}
    if (readStatus !== undefined) updateData.readStatus = readStatus
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite
    if (rating !== undefined) updateData.rating = rating
    if (memo !== undefined) updateData.memo = memo

    const updatedBookmark = await prisma.bookmark.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    return NextResponse.json({
      message: "ブックマークが更新されました",
      bookmark: {
        id: updatedBookmark.id,
        readStatus: updatedBookmark.readStatus,
        isFavorite: updatedBookmark.isFavorite,
        rating: updatedBookmark.rating,
        memo: updatedBookmark.memo,
        updatedAt: updatedBookmark.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating bookmark:', error)
    return NextResponse.json(
      { error: "ブックマークの更新に失敗しました" },
      { status: 500 }
    )
  }
}