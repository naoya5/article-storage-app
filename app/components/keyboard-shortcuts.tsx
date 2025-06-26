"use client"

import { useEffect, useState } from "react"

interface KeyboardShortcutsProps {
  onTabChange?: (tab: "articles" | "genres" | "tags" | "stats") => void
  onSearch?: () => void
}

export function KeyboardShortcuts({ onTabChange, onSearch }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K で検索にフォーカス
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        onSearch?.()
      }

      // Cmd/Ctrl + 数字でタブ切り替え
      if ((event.metaKey || event.ctrlKey) && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault()
        const tabs = ['articles', 'genres', 'tags', 'stats'] as const
        const tabIndex = parseInt(event.key) - 1
        onTabChange?.(tabs[tabIndex])
      }

      // ? でヘルプを表示/非表示
      if (event.key === '?' && !event.metaKey && !event.ctrlKey) {
        const target = event.target as HTMLElement
        // 入力フィールド内でない場合のみ
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault()
          setShowHelp(!showHelp)
        }
      }

      // Escape でモーダルを閉じる
      if (event.key === 'Escape') {
        setShowHelp(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onTabChange, onSearch, showHelp])

  if (!showHelp) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowHelp(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="キーボードショートカット (Press ?)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setShowHelp(false)}
      />
      
      {/* ヘルプモーダル */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">キーボードショートカット</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">ナビゲーション</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">記事管理</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-800">⌘ + 1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ジャンル管理</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-800">⌘ + 2</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">タグ管理</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-800">⌘ + 3</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">統計情報</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-800">⌘ + 4</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">検索</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">検索フォーカス</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-800">⌘ + K</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">その他</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ヘルプ表示</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-800">?</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">閉じる</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-800">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                ⌘ は Mac では Command、Windows では Ctrl キーです
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}