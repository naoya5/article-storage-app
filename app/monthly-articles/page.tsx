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

const platformConfig = {
  TWITTER: { name: 'Twitter', color: '#1DA1F2' },
  ZENN: { name: 'Zenn', color: '#3EA8FF' },
  QIITA: { name: 'Qiita', color: '#55C500' }
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

function getCurrentMonthName() {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
}

function getCurrentWeekName() {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  return `今週（${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}〜）`
}

export default async function MonthlyArticlesPage() {
  const stats = await getStatsData()

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                  ← 戻る
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">今月追加</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">統計データの取得に失敗しました</div>
            <Link href="/monthly-articles" className="text-blue-600 hover:text-blue-800">
              再読み込み
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← 戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">今月追加</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/total-articles" className="text-gray-600 hover:text-gray-800">
                総記事数
              </Link>
              <Link href="/favorites" className="text-gray-600 hover:text-gray-800">
                お気に入り
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* メインカード */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-4">
                {stats.basic.monthlyArticles}
              </div>
              <div className="text-xl text-gray-600 mb-2">今月の新規追加</div>
              <div className="text-sm text-gray-500">
                {getCurrentMonthName()}に追加された記事数
              </div>
            </div>
          </div>

          {/* 期間別統計 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-3">
                  {stats.basic.weeklyArticles}
                </div>
                <div className="text-lg text-gray-600 mb-1">今週追加</div>
                <div className="text-sm text-gray-500">
                  {getCurrentWeekName()}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-3">
                  {Math.round((stats.basic.monthlyArticles / (stats.basic.totalArticles || 1)) * 100)}%
                </div>
                <div className="text-lg text-gray-600 mb-1">今月の割合</div>
                <div className="text-sm text-gray-500">
                  全記事に対する今月追加分の割合
                </div>
              </div>
            </div>
          </div>

          {/* 月次推移グラフエリア（将来的に実装） */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">月次推移</h2>
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg">月次推移グラフ</div>
              <div className="text-sm">（今後実装予定）</div>
            </div>
          </div>

          {/* アクティビティパターン */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">追加パターン分析</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {Math.round(stats.basic.monthlyArticles / 30 * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">1日平均追加数</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(stats.basic.weeklyArticles / 7 * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">今週の1日平均</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {stats.basic.weeklyArticles > 0 ? '📈' : '📉'}
                </div>
                <div className="text-sm text-gray-600">
                  {stats.basic.weeklyArticles > 0 ? '活発' : '静寂'}
                </div>
              </div>
            </div>
          </div>

          {/* プラットフォーム別今月追加（推定） */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">プラットフォーム別内訳</h2>
            <div className="text-sm text-gray-500 mb-4">
              ※ 全体の割合に基づく推定値
            </div>
            <div className="space-y-4">
              {stats.platforms.map((platform) => {
                const config = platformConfig[platform.platform as keyof typeof platformConfig]
                const estimatedMonthly = Math.round(
                  (platform.count / (stats.basic.totalArticles || 1)) * stats.basic.monthlyArticles
                )
                const percentage = stats.basic.monthlyArticles > 0 
                  ? Math.round((estimatedMonthly / stats.basic.monthlyArticles) * 100)
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
                      <div className="flex-1 w-32 bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full"
                          style={{ 
                            backgroundColor: config.color,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {estimatedMonthly}
                        </div>
                        <div className="text-sm text-gray-500">
                          約{percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}