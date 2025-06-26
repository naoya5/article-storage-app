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

const readStatusConfig = {
  UNREAD: { name: '未読', color: '#6B7280' },
  READ: { name: '読了', color: '#10B981' },
  READ_LATER: { name: '後で読む', color: '#3B82F6' }
}

export default function TotalArticlesPage() {
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
                <h1 className="text-2xl font-bold text-gray-900">総記事数</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <h1 className="text-2xl font-bold text-gray-900">総記事数</h1>
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
              <h1 className="text-2xl font-bold text-gray-900">総記事数</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/monthly-articles" className="text-gray-600 hover:text-gray-800">
                今月追加
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
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {stats.basic.totalArticles}
              </div>
              <div className="text-xl text-gray-600 mb-2">登録済み記事</div>
              <div className="text-sm text-gray-500">
                全てのプラットフォームからの記事数
              </div>
            </div>
          </div>

          {/* 詳細統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.basic.totalBookmarks}
              </div>
              <div className="text-sm text-gray-600">ブックマーク済み</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats.basic.totalGenres}
              </div>
              <div className="text-sm text-gray-600">ジャンル数</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {stats.basic.totalTags}
              </div>
              <div className="text-sm text-gray-600">タグ数</div>
            </div>
          </div>

          {/* プラットフォーム別統計 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">プラットフォーム別内訳</h2>
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
                          {platform.count}
                        </div>
                        <div className="text-sm text-gray-500">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">読書ステータス</h2>
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
                            {status.count}
                          </div>
                          <div className="text-sm text-gray-500">
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