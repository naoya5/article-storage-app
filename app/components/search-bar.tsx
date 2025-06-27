"use client"

import { useState, useMemo, useCallback } from "react"
import { GenreSelector, TagSelector, PlatformSelector } from "./search-bar/"
import type { SearchFilters, Genre, Tag } from "@/types/api"

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  loading?: boolean
  availableTags?: Tag[]
  availableGenres?: Genre[]
}

export function SearchBar({ 
  onSearch, 
  loading = false, 
  availableTags = [], 
  availableGenres = [] 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState('')
  const [genreId, setGenreId] = useState('')
  const [tagId, setTagId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ query, platform, genreId, tagId, dateFrom, dateTo })
  }, [onSearch, query, platform, genreId, tagId, dateFrom, dateTo])

  const handleReset = useCallback(() => {
    setQuery('')
    setPlatform('')
    setGenreId('')
    setTagId('')
    setDateFrom('')
    setDateTo('')
    onSearch({ query: '', platform: '', genreId: '', tagId: '', dateFrom: '', dateTo: '' })
  }, [onSearch])

  const hasFilters = useMemo(() => 
    Boolean(platform || genreId || tagId || dateFrom || dateTo), 
    [platform, genreId, tagId, dateFrom, dateTo]
  )

  const filterCount = useMemo(() => 
    [platform, genreId, tagId, dateFrom, dateTo].filter(Boolean).length,
    [platform, genreId, tagId, dateFrom, dateTo]
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* 基本検索 */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="記事のタイトルや内容で検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showFilters || hasFilters
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            フィルター {hasFilters && `(${filterCount})`}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </div>

        {/* 詳細フィルター */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4">
              <PlatformSelector
                value={platform}
                onChange={setPlatform}
                disabled={loading}
              />
              <GenreSelector
                value={genreId}
                onChange={setGenreId}
                genres={availableGenres}
                disabled={loading}
              />
              <TagSelector
                value={tagId}
                onChange={setTagId}
                tags={availableTags}
                disabled={loading}
              />
            </div>

            {/* 日付範囲フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                投稿日期間
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">開始日</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">終了日</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* リセットボタン */}
        {(query || hasFilters) && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              検索条件をクリア
            </button>
          </div>
        )}
      </form>
    </div>
  )
}