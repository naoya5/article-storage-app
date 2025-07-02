import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache, cacheKeys } from "@/lib/cache"
import { redirect } from "next/navigation"

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

const readStatusConfig = {
  UNREAD: { name: '未読', color: '#6B7280' },
  READ: { name: '読了', color: '#10B981' },
  READ_LATER: { name: '後で読む', color: '#3B82F6' }
}

async function getStatsData(): Promise<StatsData | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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

export default async function FavoritesPage() {
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
                <h1 className="text-2xl font-bold text-foreground">お気に入り</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-destructive mb-4">統計データの取得に失敗しました</div>
            <Link href="/favorites" className="text-primary hover:text-primary/80">
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
              <h1 className="text-2xl font-bold text-foreground">お気に入り</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/total-articles" className="text-muted-foreground hover:text-foreground">
                総記事数
              </Link>
              <Link href="/monthly-articles" className="text-muted-foreground hover:text-foreground">
                今月追加
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
                {stats.basic.totalBookmarks}
              </div>
              <div className="text-xl text-muted-foreground mb-2">ブックマーク済み</div>
              <div className="text-sm text-muted-foreground">
                お気に入りに登録された記事数
              </div>
            </div>
          </div>

          {/* お気に入り率とその他統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-3">
                  {stats.basic.favoriteRate}%
                </div>
                <div className="text-lg text-muted-foreground mb-1">お気に入り率</div>
                <div className="text-sm text-muted-foreground">
                  全記事に対するブックマーク率
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-3">
                  {stats.readStatus.find(s => s.status === 'READ')?.count || 0}
                </div>
                <div className="text-lg text-muted-foreground mb-1">読了済み</div>
                <div className="text-sm text-muted-foreground">
                  読み終わった記事数
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-3">
                  {stats.readStatus.find(s => s.status === 'READ_LATER')?.count || 0}
                </div>
                <div className="text-lg text-muted-foreground mb-1">後で読む</div>
                <div className="text-sm text-muted-foreground">
                  読む予定の記事数
                </div>
              </div>
            </div>
          </div>

          {/* 読書ステータス詳細 */}
          {stats.readStatus.length > 0 && (
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">読書ステータス内訳</h2>
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

          {/* 評価分布 */}
          {stats.ratings.length > 0 && (
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">評価分布</h2>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const ratingData = stats.ratings.find(r => r.rating === rating)
                  const count = ratingData ? ratingData.count : 0
                  const totalRatings = stats.ratings.reduce((sum, r) => sum + r.count, 0)
                  const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
                  
                  return (
                    <div key={rating} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex">
                          {Array.from({ length: rating }, (_, i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          {Array.from({ length: 5 - rating }, (_, i) => (
                            <svg key={i} className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-lg font-medium">{rating}つ星</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 w-32 bg-secondary rounded-full h-3">
                          <div 
                            className="h-3 rounded-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-foreground">
                            {count}
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

          {/* 人気ジャンル（お気に入り観点） */}
          {stats.genres.length > 0 && (
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">お気に入りが多いジャンル</h2>
              <div className="space-y-4">
                {stats.genres.slice(0, 5).map((genre, index) => (
                  <div key={genre.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: genre.color }}
                      />
                      <span className="text-lg font-medium">{genre.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        {genre.count}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        記事
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}