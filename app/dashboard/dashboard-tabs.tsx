"use client"

import { useState } from "react"
import { Session } from "next-auth"
import { AddArticleForm } from "../components/add-article-form"
import { ArticleList } from "../components/article-list"
import { GenreManager } from "../components/genre-manager"
import { TagManager } from "../components/tag-manager"
import { StatsDashboard } from "../components/stats-dashboard"
import { RecentActivity } from "../components/recent-activity"
import { KeyboardShortcuts } from "../components/keyboard-shortcuts"
import type { Genre, Tag, Article } from "@/types/api"

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

interface DashboardTabsProps {
  initialGenres: Genre[]
  initialTags: Tag[]
  session: Session
  statsData: StatsData | null
  recentArticles: Article[]
}

export function DashboardTabs({ initialGenres, initialTags, statsData, recentArticles }: DashboardTabsProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<"articles" | "genres" | "tags" | "stats">("articles")

  const handleArticleAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleTabChange = (tab: "articles" | "genres" | "tags" | "stats") => {
    setActiveTab(tab)
  }

  const handleSearchFocus = () => {
    // 検索バーにフォーカス（記事管理タブに切り替えてからフォーカス）
    if (activeTab !== "articles") {
      setActiveTab("articles")
    }
    // 少し遅延を入れてからフォーカス
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="検索"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }, 100)
  }

  return (
    <>
      {/* タブナビゲーション */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto scrollbar-hide"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button
          onClick={() => setActiveTab("articles")}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "articles"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          記事管理
        </button>
        <button
          onClick={() => setActiveTab("genres")}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "genres"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          ジャンル管理
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "tags"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          タグ管理
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "stats"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">記事一覧</h2>
              <ArticleList 
                refreshKey={refreshKey}
                initialGenres={initialGenres}
                initialTags={initialTags}
              />
            </div>
          </div>
        </div>
      ) : activeTab === "genres" ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <GenreManager refreshKey={refreshKey} />
        </div>
      ) : activeTab === "tags" ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <TagManager refreshKey={refreshKey} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 統計ダッシュボード */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">統計ダッシュボード</h2>
              <StatsDashboard stats={statsData} />
            </div>
          </div>

          {/* 最近の活動 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-white">最近の活動</h2>
              <RecentActivity articles={recentArticles} limit={10} />
            </div>
          </div>
        </div>
      )}

      {/* キーボードショートカット */}
      <KeyboardShortcuts 
        onTabChange={handleTabChange}
        onSearch={handleSearchFocus}
      />
    </>
  )
}