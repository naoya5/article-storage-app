"use client"

import { useState } from "react"

interface Tag {
  id: string
  name: string
}

interface TagFormProps {
  tag?: Tag
  onSubmit: (data: { name: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TagForm({ tag, onSubmit, onCancel, isLoading }: TagFormProps) {
  const [name, setName] = useState(tag?.name || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('タグ名を入力してください')
      return
    }

    if (name.trim().length > 30) {
      setError('タグ名は30文字以内で入力してください')
      return
    }

    try {
      await onSubmit({
        name: name.trim()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {tag ? 'タグ編集' : 'タグ作成'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              タグ名 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: React"
              maxLength={30}
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {name.length}/30文字
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '処理中...' : (tag ? '更新' : '作成')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}