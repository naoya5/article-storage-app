"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

interface AddArticleFormProps {
  onArticleAdded?: () => void
}

export function AddArticleForm({ onArticleAdded }: AddArticleFormProps) {
  const { data: session } = useSession()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  if (!session) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700">記事を追加するにはログインが必要です。</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'URLを入力してください' })
      return
    }

    // URL形式の基本チェック
    try {
      new URL(url.trim())
    } catch {
      setMessage({ type: 'error', text: '有効なURLを入力してください（例: https://zenn.dev/...）' })
      return
    }

    // サポート対象プラットフォームの事前チェック
    const supportedDomains = ['twitter.com', 'x.com', 'zenn.dev', 'qiita.com']
    const urlObj = new URL(url.trim())
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
    
    if (!supportedDomains.includes(hostname)) {
      setMessage({ 
        type: 'error', 
        text: 'Twitter(X)、Zenn、Qiitaの記事URLのみ対応しています' 
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '記事の追加に失敗しました')
      }

      setMessage({ 
        type: 'success', 
        text: `記事「${data.article.title}」を追加しました` 
      })
      setUrl("")
      onArticleAdded?.()

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '記事の追加に失敗しました' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">記事を追加</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            記事URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://zenn.dev/username/articles/article-title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            対応プラットフォーム：
            <span className="font-medium">Twitter(X)</span>、
            <span className="font-medium">Zenn</span>、
            <span className="font-medium">Qiita</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            例：https://zenn.dev/author/articles/title
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              記事を取得中...
            </div>
          ) : (
            '記事を追加'
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}