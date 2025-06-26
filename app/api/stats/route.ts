import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
// TypeScript types for statistics

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

    const userId = session.user.id

    // 基本統計
    const [
      totalArticles,
      totalBookmarks,
      totalGenres,
      totalTags,
      monthlyArticles,
      weeklyArticles
    ] = await Promise.all([
      // 総記事数
      prisma.article.count({ where: { userId } }),
      
      // 総ブックマーク数
      prisma.bookmark.count({ where: { userId } }),
      
      // 総ジャンル数
      prisma.genre.count({ where: { userId } }),
      
      // 総タグ数
      prisma.tag.count({ where: { userId } }),
      
      // 今月の記事数
      prisma.article.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // 今週の記事数
      prisma.article.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // プラットフォーム別統計
    const platformStats = await prisma.article.groupBy({
      by: ['platform'],
      where: { userId },
      _count: { platform: true }
    })

    // 読書ステータス別統計
    const readStatusStats = await prisma.bookmark.groupBy({
      by: ['readStatus'],
      where: { userId },
      _count: { readStatus: true }
    })

    // 評価別統計
    const ratingStats = await prisma.bookmark.groupBy({
      by: ['rating'],
      where: {
        userId,
        rating: { not: null }
      },
      _count: { rating: true }
    })

    // ジャンル別記事数（上位10件）
    const genreStats = await prisma.genre.findMany({
      where: { userId },
      include: {
        articleGenres: {
          include: {
            article: true
          }
        }
      },
      orderBy: {
        articleGenres: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // タグ別記事数（上位10件）
    const tagStats = await prisma.tag.findMany({
      where: { userId },
      include: {
        articleTags: {
          include: {
            article: true
          }
        }
      },
      orderBy: {
        articleTags: {
          _count: 'desc'
        }
      },
      take: 10
    })

    // 最近の活動（過去30日間の日別記事追加数）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentActivity = await prisma.article.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 日別にグループ化
    const activityByDate = recentActivity.reduce((acc, article) => {
      const date = article.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // お気に入り率
    const favoriteRate = totalBookmarks > 0 
      ? await prisma.bookmark.count({
          where: { userId, isFavorite: true }
        }).then(count => Math.round((count / totalBookmarks) * 100))
      : 0

    return NextResponse.json({
      basic: {
        totalArticles,
        totalBookmarks,
        totalGenres,
        totalTags,
        monthlyArticles,
        weeklyArticles,
        favoriteRate
      },
      platforms: platformStats.map(stat => ({
        platform: stat.platform,
        count: stat._count.platform
      })),
      readStatus: readStatusStats.map(stat => ({
        status: stat.readStatus,
        count: stat._count.readStatus
      })),
      ratings: ratingStats.map(stat => ({
        rating: stat.rating,
        count: stat._count.rating
      })),
      genres: genreStats.map(genre => ({
        id: genre.id,
        name: genre.name,
        color: genre.color,
        count: genre.articleGenres.length
      })),
      tags: tagStats.map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tag.articleTags.length
      })),
      activity: activityByDate
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: "統計の取得に失敗しました" },
      { status: 500 }
    )
  }
}