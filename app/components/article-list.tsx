"use client"

import { useState, useEffect, useCallback } from "react"
import { SearchBar } from "./search-bar"
import { ArticleGrid, Pagination, EmptyState } from "./article-list/"
import { LoadingSpinner, ErrorDisplay } from "./tag-manager/"
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

  const handleArticleChange = () => {
    fetchArticles(currentPage)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => fetchArticles(currentPage)} />
  }

  const hasSearchFilters = Boolean(searchFilters.query || searchFilters.platform || searchFilters.genreId || searchFilters.tagId || searchFilters.dateFrom || searchFilters.dateTo)

  if (!articles.length) {
    return (
      <EmptyState
        hasSearchFilters={hasSearchFilters}
        searchLoading={searchLoading}
        availableTags={availableTags}
        availableGenres={availableGenres}
        onSearch={handleSearch}
      />
    )
  }

  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        loading={searchLoading}
        availableTags={availableTags}
        availableGenres={availableGenres}
      />

      <ArticleGrid
        articles={articles}
        onArticleChange={handleArticleChange}
      />

      {pagination && (
        <Pagination
          pagination={{
            currentPage,
            totalPages: pagination.pages,
            limit: pagination.limit,
            total: pagination.total
          }}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}