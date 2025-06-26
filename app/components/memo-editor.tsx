"use client"

import { useState, useEffect } from "react"
import { api, getErrorMessage } from "@/lib/api-client"
import type { BookmarkUpdateRequest } from "@/types/api"

interface MemoEditorProps {
  bookmarkId?: string
  currentMemo?: string | null
  onMemoChange?: (memo: string | null) => void
  loading?: boolean
  disabled?: boolean
}

export function MemoEditor({ 
  bookmarkId, 
  currentMemo, 
  onMemoChange, 
  loading = false,
  disabled = false
}: MemoEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [memoText, setMemoText] = useState(currentMemo || "")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setMemoText(currentMemo || "")
  }, [currentMemo])

  const handleSave = async () => {
    if (!bookmarkId || updating || disabled) return

    setUpdating(true)
    try {
      const finalMemo = memoText.trim() || null
      const updateData: BookmarkUpdateRequest = { memo: finalMemo }
      await api.patch(`/api/bookmarks/${bookmarkId}`, updateData)

      onMemoChange?.(finalMemo)
      setIsEditing(false)
    } catch (error) {
      console.error('Memo update error:', error)
      alert(getErrorMessage(error))
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    setMemoText(currentMemo || "")
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!bookmarkId || updating || disabled) return
    if (!confirm("メモを削除しますか？")) return

    setUpdating(true)
    try {
      const updateData: BookmarkUpdateRequest = { memo: null }
      await api.patch(`/api/bookmarks/${bookmarkId}`, updateData)

      onMemoChange?.(null)
      setMemoText("")
      setIsEditing(false)
    } catch (error) {
      console.error('Memo delete error:', error)
      alert(getErrorMessage(error))
    } finally {
      setUpdating(false)
    }
  }

  const isDisabled = loading || updating || !bookmarkId || disabled
  const hasMemo = currentMemo && currentMemo.trim().length > 0

  if (!isEditing && !hasMemo) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        disabled={isDisabled}
        className={`
          text-xs text-gray-500 hover:text-gray-700 underline
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        + メモを追加
      </button>
    )
  }

  if (!isEditing && hasMemo) {
    return (
      <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
        <div className="flex items-start justify-between mb-2">
          <div className="text-xs text-gray-600 font-medium">メモ</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isDisabled}
              className={`
                text-xs text-blue-600 hover:text-blue-800
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              編集
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleDelete}
              disabled={isDisabled}
              className={`
                text-xs text-red-600 hover:text-red-800
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              削除
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentMemo}</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-md p-3">
      <div className="text-xs text-gray-600 font-medium mb-2">メモ</div>
      <textarea
        value={memoText}
        onChange={(e) => setMemoText(e.target.value)}
        placeholder="記事についてのメモを入力..."
        disabled={isDisabled}
        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        rows={3}
        maxLength={1000}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">
          {memoText.length}/1000文字
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={isDisabled}
            className={`
              px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className={`
              px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {updating ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}