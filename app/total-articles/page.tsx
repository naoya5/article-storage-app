import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache, cacheKeys } from "@/lib/cache"
import { redirect } from "next/navigation"
import type { Session } from "next-auth"

export const dynamic = 'force-dynamic'

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

const platformConfig = {
  TWITTER: { name: 'Twitter', color: '#1DA1F2' },
  ZENN: { name: 'Zenn', color: '#3EA8FF' },
  QIITA: { name: 'Qiita', color: '#55C500' }
}

const readStatusConfig = {
  UNREAD: { name: '未読', color: '#6B7280' },
  READ: { name: '読了', color: '#10B981' },
  READ_LATER: { name: '後で読む', color: '#3B82F6' }
}

async function getStatsData(): Promise<StatsData | null> {
  try {
    const session = (await getServerSession(authOptions)) as Session
    
    if (!session.user?.id) {
      redirect('/api/auth/signin')
    }

    const userId = session.user.id
    
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

export default async function TotalArticlesPage() {
  const stats = await getStatsData()

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-primary hover:text-primary/80">
                  ← 戻る
                </Link>
                <h1 className="text-2xl font-bold text-foreground">総記事数</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-destructive mb-4">統計データの取得に失敗しました</div>
            <Link href="/total-articles" className="text-primary hover:text-primary/80">
              再読み込み
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-primary hover:text-primary/80">
                ← 戻る
              </Link>
              <h1 className="text-2xl font-bold text-foreground">総記事数</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/monthly-articles" className="text-muted-foreground hover:text-foreground">
                今月追加
              </Link>
              <Link href="/favorites" className="text-muted-foreground hover:text-foreground">
                お気に入り
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* メインカード */}
          <div className="bg-card rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-4">
                {stats.basic.totalArticles}
              </div>
              <div className="text-xl text-muted-foreground mb-2">登録済み記事</div>
              <div className="text-sm text-muted-foreground">
                全てのプラットフォームからの記事数
              </div>
            </div>
          </div>

          {/* 詳細統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-primary mb-2">
                {stats.basic.totalBookmarks}
              </div>
              <div className="text-sm text-muted-foreground">ブックマーク済み</div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-primary mb-2">
                {stats.basic.totalGenres}
              </div>
              <div className="text-sm text-muted-foreground">ジャンル数</div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-primary mb-2">
                {stats.basic.totalTags}
              </div>
              <div className="text-sm text-muted-foreground">タグ数</div>
            </div>
          </div>

          {/* プラットフォーム別統計 */}
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-6">プラットフォーム別内訳</h2>
            <div className="space-y-4">
              {stats.platforms.map((platform) => {
                const config = platformConfig[platform.platform as keyof typeof platformConfig]
                const percentage = stats.basic.totalArticles > 0 
                  ? Math.round((platform.count / stats.basic.totalArticles) * 100)
                  : 0
                
                return (
                  <div key={platform.platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-lg font-medium">{config.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 w-32 bg-secondary rounded-full h-3">
                        <div 
                          className="h-3 rounded-full"
                          style={{ 
                            backgroundColor: config.color,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-foreground">
                          {platform.count}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 読書ステータス */}
          {stats.readStatus.length > 0 && (
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">読書ステータス</h2>
              <div className="space-y-4">
                {stats.readStatus.map((status) => {
                  const config = readStatusConfig[status.status as keyof typeof readStatusConfig]
                  const percentage = stats.basic.totalBookmarks > 0 
                    ? Math.round((status.count / stats.basic.totalBookmarks) * 100)
                    : 0
                  
                  return (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-lg font-medium">{config.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 w-32 bg-secondary rounded-full h-3">
                          <div 
                            className="h-3 rounded-full"
                            style={{ 
                              backgroundColor: config.color,
                              width: `${percentage}%`
                            }}
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-foreground">
                            {status.count}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}