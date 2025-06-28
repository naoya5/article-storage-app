import { memo } from "react"
import type { Genre } from "@/types/api"

interface GenreSelectorProps {
  value: string
  onChange: (value: string) => void
  genres: Genre[]
  disabled?: boolean
}

export const GenreSelector = memo(function GenreSelector({ 
  value, 
  onChange, 
  genres, 
  disabled = false 
}: GenreSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
        ジャンル
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={disabled}
      >
        <option value="">すべて</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
    </div>
  )
})