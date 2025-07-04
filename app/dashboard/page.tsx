import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache, cacheKeys } from "@/lib/cache"
import { redirect } from "next/navigation"
import { DashboardTabs } from "./dashboard-tabs"
import { DarkModeToggle } from "@/app/components/dark-mode-toggle"
import type { Genre, Tag } from "@/types/api"
import Link from "next/link"
import type { Session } from "next-auth"

interface StatsData {
  basic: {
    totalArticles: number
    totalBookmarks: number
    totalGenres: number
    totalTags: number
    monthlyArticles: number
    weeklyArticles: number
    favoriteRate: number
  }
  platforms: Array<{
    platform: string
    count: number
  }>
  readStatus: Array<{
    status: string
    count: number
  }>
  ratings: Array<{
    rating: number
    count: number
  }>
  genres: Array<{
    id: string
    name: string
    color: string
    count: number
  }>
  tags: Array<{
    id: string
    name: string
    count: number
  }>
  activity: Record<string, number>
}

export const dynamic = "force-dynamic"

async function getStatsData(userId: string): Promise<StatsData | null> {
  try {
    // キャッシュをチェック
    const cacheKey = cacheKeys.stats(userId)
    const cachedStats = cache.get(cacheKey)
    if (cachedStats) {
      return cachedStats as StatsData
    }

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

    const statsData = {
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
        rating: stat.rating || 0,
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
    }
    
    // キャッシュに保存（10分間）
    cache.set(cacheKey, statsData, 10 * 60 * 1000)

    return statsData

  } catch (error) {
    console.error('Error fetching stats:', error)
    return null
  }
}

// Server Componentでデータフェッチング
async function getDashboardData(userId: string) {
  const [genres, tags, stats, recentArticles] = await Promise.all([
    // ジャンル取得
    prisma.genre.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }),
    
    // タグ取得
    prisma.tag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }),
    
    // 統計情報取得
    getStatsData(userId),
    
    // 最近の記事取得
    prisma.article.findMany({
      where: { userId },
      include: {
        articleGenres: {
          include: {
            genre: true
          }
        },
        articleTags: {
          include: {
            tag: true
          }
        },
        bookmarks: {
          where: { userId }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  return {
    genres: genres.map(genre => ({
      id: genre.id,
      name: genre.name,
      color: genre.color
    })) as Genre[],
    tags: tags.map(tag => ({
      id: tag.id,
      name: tag.name
    })) as Tag[],
    stats,
    recentArticles: recentArticles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      thumbnail: article.thumbnail,
      author: article.author,
      platform: article.platform,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      articleGenres: article.articleGenres.map(ag => ({
        id: ag.articleId + ag.genreId, // 複合キーとしてIDを生成
        genreId: ag.genreId,
        genre: {
          id: ag.genre.id,
          name: ag.genre.name,
          color: ag.genre.color
        }
      })),
      articleTags: article.articleTags.map(at => ({
        id: at.articleId + at.tagId, // 複合キーとしてIDを生成
        tagId: at.tagId,
        tag: {
          id: at.tag.id,
          name: at.tag.name
        }
      })),
      bookmarks: article.bookmarks
    }))
  }
}

export default async function DashboardPage() {
  const session = (await getServerSession(authOptions)) as Session

  if (!session.user?.id) {
    redirect("/")
  }

  const { genres, tags, stats, recentArticles } = await getDashboardData(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-background/90 dark:bg-gray-900/90 backdrop-blur-sm border-border dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                ← ホーム
              </Link>
              <div className="h-6 w-px bg-border dark:bg-gray-600"></div>
              <Link 
                href="/articles" 
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                記事一覧
              </Link>
              <h1 className="text-2xl font-bold text-foreground">ダッシュボード</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                ようこそ、{session.user?.name || session.user?.email}さん
              </div>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* タブ管理とコンテンツ - Client Component */}
        <DashboardTabs 
          initialGenres={genres}
          initialTags={tags}
          session={session}
          statsData={stats}
          recentArticles={recentArticles}
        />
      </main>
    </div>
  )
}
