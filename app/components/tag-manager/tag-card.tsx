"use client"

interface Tag {
  id: string
  name: string
  articleCount: number
  createdAt: string
}

interface TagCardProps {
  tag: Tag
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
}

export function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
            #{tag.name}
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(tag)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(tag)}
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
  )
}