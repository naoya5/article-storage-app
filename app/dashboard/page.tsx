"use client"

import { useSession } from "next-auth/react"
import { AddArticleForm } from "../components/add-article-form"
import { ArticleList } from "../components/article-list"
import { useState } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [refreshKey, setRefreshKey] = useState(0)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ダッシュボード</h1>
          <p className="text-gray-600">ダッシュボードにアクセスするにはログインが必要です。</p>
        </div>
      </div>
    )
  }

  const handleArticleAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <div className="text-sm text-gray-600">
              ようこそ、{session.user?.name || session.user?.email}さん
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 記事追加フォーム */}
          <div className="lg:col-span-1">
            <AddArticleForm onArticleAdded={handleArticleAdded} />
          </div>

          {/* メインコンテンツエリア */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">記事一覧</h2>
              <ArticleList refreshKey={refreshKey} />
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">総記事数</h3>
            <p className="text-3xl font-bold text-blue-600">-</p>
            <p className="text-sm text-gray-500">登録済み記事</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">今月追加</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
            <p className="text-sm text-gray-500">今月の新規追加</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">お気に入り</h3>
            <p className="text-3xl font-bold text-purple-600">-</p>
            <p className="text-sm text-gray-500">ブックマーク済み</p>
          </div>
        </div>
      </main>
    </div>
  )
}