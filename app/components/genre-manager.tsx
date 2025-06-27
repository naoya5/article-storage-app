"use client"

import { useState, useEffect } from "react"
import { GenreForm } from "./genre-form"
import { GenreList } from "./genre-manager/"
import { LoadingSpinner, ErrorDisplay } from "./tag-manager/"
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
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchGenres} />
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

      <GenreList
        genres={genres}
        onEdit={setEditingGenre}
        onDelete={handleDeleteGenre}
        onShowForm={() => setShowForm(true)}
      />

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