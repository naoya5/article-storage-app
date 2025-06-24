"use client"

import { useState, useEffect } from "react"
import { ArticleCard } from "./article-card"

interface Article {
  id: string
  title: string
  description?: string | null
  url: string
  platform: "TWITTER" | "ZENN" | "QIITA"
  author?: string | null
  publishedAt?: Date | null
  thumbnail?: string | null
  createdAt: Date
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ArticleListResponse {
  articles: Article[]
  pagination: Pagination
}

interface ArticleListProps {
  refreshKey?: number
}

export function ArticleList({ refreshKey }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/articles?page=${page}&limit=6`)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("認証が必要です")
        }
        throw new Error("記事の取得に失敗しました")
      }

      const data: ArticleListResponse = await response.json()
      setArticles(data.articles)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
      setArticles([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles(currentPage)
  }, [currentPage, refreshKey])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchArticles(currentPage)}
          className="text-blue-600 hover:text-blue-800"
        >
          再試行
        </button>
      </div>
    )
  }

  if (!articles.length) {
    return (
      <div className="text-center py-12 text-gray-600">
        <div className="mb-4">まだ記事が登録されていません</div>
        <div className="text-sm">記事を追加してお試しください！</div>
      </div>
    )
  }

  return (
    <div>
      {/* 記事カード */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* ページネーション */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "text-white bg-blue-600 hover:bg-blue-700"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      )}

      {/* 記事数表示 */}
      {pagination && (
        <div className="text-center text-sm text-gray-600 mt-4">
          {pagination.total}件中 {(currentPage - 1) * pagination.limit + 1}〜
          {Math.min(currentPage * pagination.limit, pagination.total)}件を表示
        </div>
      )}
    </div>
  )
}