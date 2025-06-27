"use client"

import { GenreCard } from "./genre-card"

interface Genre {
  id: string
  name: string
  description?: string | null
  color: string
  articleCount: number
  createdAt: string
}

interface GenreListProps {
  genres: Genre[]
  onEdit: (genre: Genre) => void
  onDelete: (genre: Genre) => void
  onShowForm: () => void
}

export function GenreList({ genres, onEdit, onDelete, onShowForm }: GenreListProps) {
  if (genres.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <div className="mb-4">まだジャンルが作成されていません</div>
        <button
          onClick={onShowForm}
          className="text-blue-600 hover:text-blue-800"
        >
          最初のジャンルを作成する
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {genres.map((genre) => (
        <GenreCard
          key={genre.id}
          genre={genre}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}