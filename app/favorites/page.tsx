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

const readStatusConfig = {
  UNREAD: { name: '未読', color: '#6B7280' },
  READ: { name: '読了', color: '#10B981' },
  READ_LATER: { name: '後で読む', color: '#3B82F6' }
}

export default function FavoritesPage() {
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
                <h1 className="text-2xl font-bold text-gray-900">お気に入り</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                <h1 className="text-2xl font-bold text-gray-900">お気に入り</h1>
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
              <h1 className="text-2xl font-bold text-gray-900">お気に入り</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/total-articles" className="text-gray-600 hover:text-gray-800">
                総記事数
              </Link>
              <Link href="/monthly-articles" className="text-gray-600 hover:text-gray-800">
                今月追加
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
              <div className="text-6xl font-bold text-purple-600 mb-4">
                {stats.basic.totalBookmarks}
              </div>
              <div className="text-xl text-gray-600 mb-2">ブックマーク済み</div>
              <div className="text-sm text-gray-500">
                お気に入りに登録された記事数
              </div>
            </div>
          </div>

          {/* お気に入り率とその他統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500 mb-3">
                  {stats.basic.favoriteRate}%
                </div>
                <div className="text-lg text-gray-600 mb-1">お気に入り率</div>
                <div className="text-sm text-gray-500">
                  全記事に対するブックマーク率
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-3">
                  {stats.readStatus.find(s => s.status === 'READ')?.count || 0}
                </div>
                <div className="text-lg text-gray-600 mb-1">読了済み</div>
                <div className="text-sm text-gray-500">
                  読み終わった記事数
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-3">
                  {stats.readStatus.find(s => s.status === 'READ_LATER')?.count || 0}
                </div>
                <div className="text-lg text-gray-600 mb-1">後で読む</div>
                <div className="text-sm text-gray-500">
                  読む予定の記事数
                </div>
              </div>
            </div>
          </div>

          {/* 読書ステータス詳細 */}
          {stats.readStatus.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">読書ステータス内訳</h2>
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

          {/* 評価分布 */}
          {stats.ratings.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">評価分布</h2>
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
                            <svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-lg font-medium">{rating}つ星</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            {count}
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

          {/* 人気ジャンル（お気に入り観点） */}
          {stats.genres.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">お気に入りが多いジャンル</h2>
              <div className="space-y-4">
                {stats.genres.slice(0, 5).map((genre, index) => (
                  <div key={genre.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: genre.color }}
                      />
                      <span className="text-lg font-medium">{genre.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {genre.count}
                      </div>
                      <div className="text-sm text-gray-500">
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