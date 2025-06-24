"use client"

import { useState, useEffect } from "react"

interface Genre {
  id: string
  name: string
  color: string
}

interface ArticleGenre {
  id: string
  genreId: string
  genre: Genre
}

interface ArticleGenreSelectorProps {
  articleId: string
  currentGenres: ArticleGenre[]
  onGenresChange: () => void
}

export function ArticleGenreSelector({ 
  articleId, 
  currentGenres, 
  onGenresChange 
}: ArticleGenreSelectorProps) {
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres')
      if (response.ok) {
        const data = await response.json()
        setAvailableGenres(data.genres)
      }
    } catch (err) {
      console.error('Error fetching genres:', err)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  const handleAddGenre = async (genreId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/genres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genreId }),
      })

      if (response.ok) {
        onGenresChange()
        setShowSelector(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'ジャンルの追加に失敗しました')
      }
    } catch (err) {
      console.error('Error adding genre:', err)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveGenre = async (genreId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/genres`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genreId }),
      })

      if (response.ok) {
        onGenresChange()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'ジャンルの削除に失敗しました')
      }
    } catch (err) {
      console.error('Error removing genre:', err)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const currentGenreIds = currentGenres.map(ag => ag.genreId)
  const availableToAdd = (availableGenres || []).filter(genre => 
    !currentGenreIds.includes(genre.id)
  )

  return (
    <div className="space-y-2">
      {/* 現在のジャンル */}
      <div className="flex flex-wrap gap-2">
        {currentGenres.map((articleGenre) => (
          <span
            key={articleGenre.id}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: articleGenre.genre.color }}
          >
            {articleGenre.genre.name}
            <button
              onClick={() => handleRemoveGenre(articleGenre.genreId)}
              disabled={loading}
              className="ml-1 text-white hover:text-gray-200"
              title="ジャンルを削除"
            >
              ×
            </button>
          </span>
        ))}
        
        {/* ジャンル追加ボタン */}
        {availableToAdd.length > 0 && (
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            + ジャンル追加
          </button>
        )}
      </div>

      {/* ジャンル選択ドロップダウン */}
      {showSelector && availableToAdd.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700">ジャンルを選択</div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {availableToAdd.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleAddGenre(genre.id)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
                >
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: genre.color }}
                  />
                  <span>{genre.name}</span>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={() => setShowSelector(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}