"use client"

import { useState } from "react"

interface Genre {
  id: string
  name: string
  description?: string | null
  color: string
}

interface GenreFormProps {
  genre?: Genre
  onSubmit: (data: { name: string; description?: string; color: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const colorOptions = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#6B7280', // Gray
]

export function GenreForm({ genre, onSubmit, onCancel, isLoading }: GenreFormProps) {
  const [name, setName] = useState(genre?.name || '')
  const [description, setDescription] = useState(genre?.description || '')
  const [color, setColor] = useState(genre?.color || '#3B82F6')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('ジャンル名を入力してください')
      return
    }

    if (name.trim().length > 50) {
      setError('ジャンル名は50文字以内で入力してください')
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {genre ? 'ジャンル編集' : 'ジャンル作成'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              ジャンル名 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: プログラミング"
              maxLength={50}
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {name.length}/50文字
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明（任意）
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ジャンルの説明を入力（任意）"
              rows={3}
              maxLength={200}
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/200文字
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カラー
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  disabled={isLoading}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600">選択中: {color}</span>
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
              {isLoading ? '処理中...' : (genre ? '更新' : '作成')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}