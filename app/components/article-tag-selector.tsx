"use client"

import { useState, useEffect } from "react"

interface Tag {
  id: string
  name: string
}

interface ArticleTag {
  id: string
  tagId: string
  tag: Tag
}

interface ArticleTagSelectorProps {
  articleId: string
  currentTags: ArticleTag[]
  onTagsChange: () => void
}

export function ArticleTagSelector({ 
  articleId, 
  currentTags, 
  onTagsChange 
}: ArticleTagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data.tags)
      }
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleAddTag = async (tagId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      })

      if (response.ok) {
        onTagsChange()
        setShowSelector(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'タグの追加に失敗しました')
      }
    } catch (err) {
      console.error('Error adding tag:', err)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagId }),
      })

      if (response.ok) {
        onTagsChange()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'タグの削除に失敗しました')
      }
    } catch (err) {
      console.error('Error removing tag:', err)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const currentTagIds = currentTags.map(at => at.tagId)
  const availableToAdd = (availableTags || []).filter(tag => 
    !currentTagIds.includes(tag.id)
  )

  return (
    <div className="space-y-2">
      {/* 現在のタグ */}
      <div className="flex flex-wrap gap-2">
        {currentTags.map((articleTag) => (
          <span
            key={articleTag.id}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-700 bg-gray-100"
          >
            #{articleTag.tag.name}
            <button
              onClick={() => handleRemoveTag(articleTag.tagId)}
              disabled={loading}
              className="ml-1 text-gray-500 hover:text-gray-700"
              title="タグを削除"
            >
              ×
            </button>
          </span>
        ))}
        
        {/* タグ追加ボタン */}
        {availableToAdd.length > 0 ? (
          <button
            key="add-tag-button"
            onClick={() => setShowSelector(!showSelector)}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            + タグ追加
          </button>
        ) : availableTags.length === 0 ? (
          <span 
            key="no-tags-message"
            className="inline-flex items-center px-2 py-1 rounded-full text-xs text-gray-400 bg-gray-50 border border-gray-200"
          >
            タグ管理画面でタグを作成してください
          </span>
        ) : (
          <span 
            key="all-tags-added-message"
            className="inline-flex items-center px-2 py-1 rounded-full text-xs text-gray-400 bg-gray-50 border border-gray-200"
          >
            すべてのタグが追加済みです
          </span>
        )}
      </div>

      {/* タグ選択ドロップダウン */}
      {showSelector && availableToAdd.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-700">タグを選択</div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {availableToAdd.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
                >
                  <span className="text-gray-500">#</span>
                  <span>{tag.name}</span>
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