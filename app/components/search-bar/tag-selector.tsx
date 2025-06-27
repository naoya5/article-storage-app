import { memo } from "react"
import type { Tag } from "@/types/api"

interface TagSelectorProps {
  value: string
  onChange: (value: string) => void
  tags: Tag[]
  disabled?: boolean
}

export const TagSelector = memo(function TagSelector({ 
  value, 
  onChange, 
  tags, 
  disabled = false 
}: TagSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        タグ
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={disabled}
      >
        <option value="">すべて</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            #{tag.name}
          </option>
        ))}
      </select>
    </div>
  )
})