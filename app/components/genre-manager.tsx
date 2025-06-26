"use client"

import { useState, useEffect } from "react"
import { GenreForm } from "./genre-form"
import { api, getErrorMessage } from "@/lib/api-client"
import type { Genre as BaseGenre } from "@/types/api"

interface Genre {
  id: string
  name: string
  description?: string | null
  color: string
  articleCount: number
  createdAt: string
}

interface GenreManagerProps {
  refreshKey?: number
  initialGenres?: BaseGenre[]
}

export function GenreManager({ refreshKey }: GenreManagerProps) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchGenres = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await api.get<{ genres: Genre[] }>('/api/genres')
      setGenres(data.genres)
    } catch (err) {
      setError(getErrorMessage(err))
      setGenres([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [refreshKey])

  const handleCreateGenre = async (data: { name: string; description?: string; color: string }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ジャンルの作成に失敗しました')
      }

      await fetchGenres()
      setShowForm(false)
    } catch (err) {
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditGenre = async (data: { name: string; description?: string; color: string }) => {
    if (!editingGenre) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/genres/${editingGenre.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ジャンルの更新に失敗しました')
      }

      await fetchGenres()
      setEditingGenre(null)
    } catch (err) {
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGenre = async (genre: Genre) => {
    if (genre.articleCount > 0) {
      alert('このジャンルには記事が関連付けられているため削除できません')
      return
    }

    if (!confirm(`「${genre.name}」を削除しますか？`)) {
      return
    }

    try {
      const response = await fetch(`/api/genres/${genre.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ジャンルの削除に失敗しました')
      }

      await fetchGenres()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchGenres}
          className="text-blue-600 hover:text-blue-800"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">ジャンル管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          ジャンル作成
        </button>
      </div>

      {genres.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <div className="mb-4">まだジャンルが作成されていません</div>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            最初のジャンルを作成する
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {genres.map((genre) => (
            <div key={genre.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: genre.color }}
                  />
                  <h3 className="font-medium text-gray-900">{genre.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingGenre(genre)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteGenre(genre)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="削除"
                    disabled={genre.articleCount > 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {genre.description && (
                <p className="text-sm text-gray-600 mb-3">{genre.description}</p>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{genre.articleCount}件の記事</span>
                <span>{new Date(genre.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <GenreForm
          onSubmit={handleCreateGenre}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      )}

      {editingGenre && (
        <GenreForm
          genre={editingGenre}
          onSubmit={handleEditGenre}
          onCancel={() => setEditingGenre(null)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}