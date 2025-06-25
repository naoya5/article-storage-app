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

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
      include: {
        articleTags: {
          include: { article: true }
        }
      }
    })

    const tagsWithCount = tags.map(tag => ({
      ...tag,
      articleCount: tag.articleTags.length
    }))

    return NextResponse.json({ tags: tagsWithCount })

  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: "タグの取得に失敗しました" },
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

    // 重複チェック
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
        userId: session.user.id
      }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "同じ名前のタグが既に存在します" },
        { status: 409 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: "タグが正常に作成されました",
      tag: {
        id: tag.id,
        name: tag.name,
        createdAt: tag.createdAt,
      }
    })

  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: "タグの作成に失敗しました" },
      { status: 500 }
    )
  }
}