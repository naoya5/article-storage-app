"use client"

import { useState, useEffect } from "react"
import { TagForm } from "./tag-form"
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
          onClick={fetchTags}
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
        <h2 className="text-xl font-semibold">タグ管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          タグ作成
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <div className="mb-4">まだタグが作成されていません</div>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            最初のタグを作成する
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <div key={tag.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    #{tag.name}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingTag(tag)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="削除"
                    disabled={tag.articleCount > 0}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{tag.articleCount}件の記事</span>
                <span>{new Date(tag.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

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