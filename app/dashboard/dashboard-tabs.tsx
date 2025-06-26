"use client"

import { useState } from "react"
import { Session } from "next-auth"
import { AddArticleForm } from "../components/add-article-form"
import { ArticleList } from "../components/article-list"
import { GenreManager } from "../components/genre-manager"
import { TagManager } from "../components/tag-manager"
import { StatsDashboard } from "../components/stats-dashboard"
import { RecentActivity } from "../components/recent-activity"
import type { Genre, Tag } from "@/types/api"

interface DashboardTabsProps {
  initialGenres: Genre[]
  initialTags: Tag[]
  session: Session
}

export function DashboardTabs({ initialGenres, initialTags }: DashboardTabsProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<"articles" | "genres" | "tags" | "stats">("articles")

  const handleArticleAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <>
      {/* タブナビゲーション */}
      <div className="flex flex-wrap sm:flex-nowrap space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "articles"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          記事管理
        </button>
        <button
          onClick={() => setActiveTab("genres")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "genres"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ジャンル管理
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "tags"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          タグ管理
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "stats"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          統計情報
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === "articles" ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 記事追加フォーム */}
          <div className="lg:col-span-1">
            <AddArticleForm onArticleAdded={handleArticleAdded} />
          </div>

          {/* メインコンテンツエリア */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">記事一覧</h2>
              <ArticleList 
                refreshKey={refreshKey}
                initialGenres={initialGenres}
                initialTags={initialTags}
              />
            </div>
          </div>
        </div>
      ) : activeTab === "genres" ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <GenreManager refreshKey={refreshKey} />
        </div>
      ) : activeTab === "tags" ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <TagManager refreshKey={refreshKey} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 統計ダッシュボード */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">統計ダッシュボード</h2>
              <StatsDashboard />
            </div>
          </div>

          {/* 最近の活動 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">最近の活動</h2>
              <RecentActivity limit={10} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}