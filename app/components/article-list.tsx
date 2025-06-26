"use client"

import { useState, useEffect, useCallback } from "react"
import { ArticleCard } from "./article-card"
import { SearchBar } from "./search-bar"
import { api, getErrorMessage } from "@/lib/api-client"
import type { 
  Article, 
  ArticleListResponse, 
  ArticleListParams, 
  SearchFilters,
  Genre,
  Tag
} from "@/types/api"

interface ArticleListProps {
  refreshKey?: number
  initialGenres?: Genre[]
  initialTags?: Tag[]
}

export function ArticleList({ refreshKey, initialGenres = [], initialTags = [] }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<ArticleListResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    platform: '',
    genreId: '',
    tagId: '',
    dateFrom: '',
    dateTo: ''
  })
  const [availableTags, setAvailableTags] = useState<Tag[]>(initialTags)
  const [availableGenres, setAvailableGenres] = useState<Genre[]>(initialGenres)
  const [searchLoading, setSearchLoading] = useState(false)

  const fetchArticles = useCallback(async (page: number = 1, filters?: SearchFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentFilters = filters || searchFilters
      const params: ArticleListParams = {
        page,
        limit: 6,
        ...(currentFilters.query && { query: currentFilters.query }),
        ...(currentFilters.platform && { platform: currentFilters.platform }),
        ...(currentFilters.genreId && { genreId: currentFilters.genreId }),
        ...(currentFilters.tagId && { tagId: currentFilters.tagId }),
        ...(currentFilters.dateFrom && { dateFrom: currentFilters.dateFrom }),
        ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo }),
      }

      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString()
      
      const data = await api.get<ArticleListResponse>(`/api/articles?${queryString}`)
      setArticles(data.articles)
      setPagination(data.pagination)
    } catch (err) {
      setError(getErrorMessage(err))
      setArticles([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [searchFilters])

  const fetchFilters = useCallback(async () => {
    try {
      // 初期データがない場合のみAPIから取得
      if (initialTags.length === 0 && initialGenres.length === 0) {
        const [tagsData, genresData] = await Promise.all([
          api.get<{ tags: Tag[] }>('/api/tags'),
          api.get<{ genres: Genre[] }>('/api/genres')
        ])
        setAvailableTags(tagsData.tags)
        setAvailableGenres(genresData.genres)
      } else if (initialTags.length === 0) {
        const tagsData = await api.get<{ tags: Tag[] }>('/api/tags')
        setAvailableTags(tagsData.tags)
      } else if (initialGenres.length === 0) {
        const genresData = await api.get<{ genres: Genre[] }>('/api/genres')
        setAvailableGenres(genresData.genres)
      }
    } catch (err) {
      console.error('Error fetching filters:', getErrorMessage(err))
    }
  }, [initialTags.length, initialGenres.length])

  useEffect(() => {
    fetchArticles(currentPage)
  }, [currentPage, refreshKey, fetchArticles])

  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])

  const handleSearch = async (filters: SearchFilters) => {
    setSearchFilters(filters)
    setCurrentPage(1)
    setSearchLoading(true)
    try {
      await fetchArticles(1, filters)
    } finally {
      setSearchLoading(false)
    }
  }

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

  const hasSearchFilters = searchFilters.query || searchFilters.platform || searchFilters.genreId || searchFilters.tagId || searchFilters.dateFrom || searchFilters.dateTo

  if (!articles.length) {
    return (
      <div>
        {/* 検索バー */}
        <SearchBar
          onSearch={handleSearch}
          loading={searchLoading}
          availableTags={availableTags}
          availableGenres={availableGenres}
        />
        
        <div className="text-center py-12 text-gray-600">
          {hasSearchFilters ? (
            <div>
              <div className="mb-4">検索条件に一致する記事が見つかりませんでした</div>
              <div className="text-sm">検索条件を変更してお試しください</div>
            </div>
          ) : (
            <div>
              <div className="mb-4">まだ記事が登録されていません</div>
              <div className="text-sm">記事を追加してお試しください！</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 検索バー */}
      <SearchBar
        onSearch={handleSearch}
        loading={searchLoading}
        availableTags={availableTags}
        availableGenres={availableGenres}
      />

      {/* 記事カード */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            onGenresChange={() => fetchArticles(currentPage)}
            onTagsChange={() => fetchArticles(currentPage)}
            onBookmarkChange={() => fetchArticles(currentPage)}
          />
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