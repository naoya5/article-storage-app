"use client"

import { useState } from "react"
import { ReadStatus } from "@prisma/client"

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
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ readStatus: newStatus })
      })

      if (!response.ok) {
        throw new Error('読書ステータスの更新に失敗しました')
      }

      onStatusChange?.(newStatus)
    } catch (error) {
      console.error('Read status update error:', error)
      alert(error instanceof Error ? error.message : 'エラーが発生しました')
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