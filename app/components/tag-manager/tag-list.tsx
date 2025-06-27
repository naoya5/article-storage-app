"use client"

import { TagCard } from "./tag-card"

interface Tag {
  id: string
  name: string
  articleCount: number
  createdAt: string
}

interface TagListProps {
  tags: Tag[]
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
  onShowForm: () => void
}

export function TagList({ tags, onEdit, onDelete, onShowForm }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <div className="mb-4">まだタグが作成されていません</div>
        <button
          onClick={onShowForm}
          className="text-blue-600 hover:text-blue-800"
        >
          最初のタグを作成する
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <TagCard
          key={tag.id}
          tag={tag}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}