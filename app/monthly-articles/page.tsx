"use client"

import { useState, useEffect } from "react"
import { api, getErrorMessage } from "@/lib/api-client"
import Link from "next/link"

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

export default function MonthlyArticlesPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<StatsData>('/api/stats')
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const getCurrentMonthName = () => {
    const now = new Date()
    return `${now.getFullYear()}年${now.getMonth() + 1}月`
  }

  const getCurrentWeekName = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    return `今週（${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}〜）`
  }

  if (loading) {
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
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
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
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchStats}
              className="text-blue-600 hover:text-blue-800"
            >
              再試行
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!stats) return null

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