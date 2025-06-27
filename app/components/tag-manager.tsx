"use client"

import { useState, useEffect } from "react"
import { TagForm } from "./tag-form"
import { TagList, LoadingSpinner, ErrorDisplay } from "./tag-manager/"
import { api, getErrorMessage } from "@/lib/api-client"
import type { Tag as BaseTag } from "@/types/api"

interface Tag {
  id: string
  name: string
  articleCount: number
  createdAt: string
}

interface TagManagerProps {
  refreshKey?: number
  initialTags?: BaseTag[]
}

export function TagManager({ refreshKey }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await api.get<{ tags: Tag[] }>('/api/tags')
      setTags(data.tags)
    } catch (err) {
      setError(getErrorMessage(err))
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [refreshKey])

  const handleCreateTag = async (data: { name: string }) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'タグの作成に失敗しました')
      }

      await fetchTags()
      setShowForm(false)
    } catch (err) {
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTag = async (data: { name: string }) => {
    if (!editingTag) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'タグの更新に失敗しました')
      }

      await fetchTags()
      setEditingTag(null)
    } catch (err) {
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTag = async (tag: Tag) => {
    if (tag.articleCount > 0) {
      alert('このタグには記事が関連付けられているため削除できません')
      return
    }

    if (!confirm(`「${tag.name}」を削除しますか？`)) {
      return
    }

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'タグの削除に失敗しました')
      }

      await fetchTags()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchTags} />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">タグ管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          タグ作成
        </button>
      </div>

      <TagList
        tags={tags}
        onEdit={setEditingTag}
        onDelete={handleDeleteTag}
        onShowForm={() => setShowForm(true)}
      />

      {showForm && (
        <TagForm
          onSubmit={handleCreateTag}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      )}

      {editingTag && (
        <TagForm
          tag={editingTag}
          onSubmit={handleEditTag}
          onCancel={() => setEditingTag(null)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}