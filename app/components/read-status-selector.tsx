"use client"

import { useState } from "react"
import { ReadStatus } from "@prisma/client"
import { api, getErrorMessage } from "@/lib/api-client"
import type { BookmarkUpdateRequest } from "@/types/api"

interface ReadStatusSelectorProps {
  bookmarkId?: string
  currentStatus: ReadStatus
  onStatusChange?: (status: ReadStatus) => void
  loading?: boolean
}

const statusConfig = {
  UNREAD: {
    label: "未読",
    color: "bg-gray-100 text-gray-600",
    hoverColor: "hover:bg-gray-200"
  },
  READ: {
    label: "読了",
    color: "bg-green-100 text-green-700",
    hoverColor: "hover:bg-green-200"
  },
  READ_LATER: {
    label: "後で読む",
    color: "bg-blue-100 text-blue-700", 
    hoverColor: "hover:bg-blue-200"
  }
} as const

export function ReadStatusSelector({ 
  bookmarkId, 
  currentStatus, 
  onStatusChange, 
  loading = false 
}: ReadStatusSelectorProps) {
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: ReadStatus) => {
    if (!bookmarkId || updating) return

    setUpdating(true)
    try {
      const updateData: BookmarkUpdateRequest = { readStatus: newStatus }
      await api.patch(`/api/bookmarks/${bookmarkId}`, updateData)

      onStatusChange?.(newStatus)
    } catch (error) {
      console.error('Read status update error:', error)
      alert(getErrorMessage(error))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {Object.entries(statusConfig).map(([status, config]) => {
        const isSelected = currentStatus === status
        const isDisabled = loading || updating || !bookmarkId

        return (
          <button
            key={status}
            onClick={() => handleStatusChange(status as ReadStatus)}
            disabled={isDisabled}
            className={`
              px-2 py-1 text-xs font-medium rounded transition-colors
              ${isSelected 
                ? config.color 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`読書ステータスを「${config.label}」に変更`}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  )
}