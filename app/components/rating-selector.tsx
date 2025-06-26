"use client"

import { useState } from "react"
import { api, getErrorMessage } from "@/lib/api-client"
import type { BookmarkUpdateRequest } from "@/types/api"

interface RatingSelectorProps {
  bookmarkId?: string
  currentRating?: number | null
  onRatingChange?: (rating: number | null) => void
  loading?: boolean
  disabled?: boolean
}

export function RatingSelector({ 
  bookmarkId, 
  currentRating, 
  onRatingChange, 
  loading = false,
  disabled = false
}: RatingSelectorProps) {
  const [updating, setUpdating] = useState(false)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const handleRatingChange = async (rating: number | null) => {
    if (!bookmarkId || updating || disabled) return

    setUpdating(true)
    try {
      const updateData: BookmarkUpdateRequest = { rating }
      await api.patch(`/api/bookmarks/${bookmarkId}`, updateData)

      onRatingChange?.(rating)
    } catch (error) {
      console.error('Rating update error:', error)
      alert(getErrorMessage(error))
    } finally {
      setUpdating(false)
    }
  }

  const isDisabled = loading || updating || !bookmarkId || disabled

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = currentRating ? star <= currentRating : false
          const isHovered = hoveredRating ? star <= hoveredRating : false
          const shouldHighlight = isHovered || (isFilled && !hoveredRating)

          return (
            <button
              key={star}
              onClick={() => handleRatingChange(star)}
              onMouseEnter={() => !isDisabled && setHoveredRating(star)}
              onMouseLeave={() => !isDisabled && setHoveredRating(null)}
              disabled={isDisabled}
              className={`
                p-0.5 transition-colors
                ${shouldHighlight 
                  ? 'text-yellow-500' 
                  : 'text-gray-400 dark:text-gray-600 hover:text-yellow-400'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={`${star}つ星で評価`}
            >
              <svg
                className="w-4 h-4"
                fill={shouldHighlight ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )
        })}
      </div>
      
      {currentRating && (
        <button
          onClick={() => handleRatingChange(null)}
          disabled={isDisabled}
          className={`
            ml-2 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title="評価をクリア"
        >
          クリア
        </button>
      )}
    </div>
  )
}