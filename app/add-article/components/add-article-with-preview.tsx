"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ArticlePreview } from "./article-preview"

interface Article {
  title: string
  description: string
  url: string
  author: string
  platform: string
  publishedAt: string
  imageUrl?: string
}

export function AddArticleWithPreview() {
  const { data: session } = useSession()
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previewData, setPreviewData] = useState<Article | null>(null)

  if (!session) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-700 dark:text-blue-300">記事を追加するにはログインが必要です。</p>
      </div>
    )
  }

  // URLの変更を監視してプレビューを更新
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url.trim()) {
        fetchPreview(url.trim())
      } else {
        setPreviewData(null)
      }
    }, 500) // 500ms のデバウンス

    return () => clearTimeout(timer)
  }, [url])

  const fetchPreview = async (articleUrl: string) => {
    try {
      // URL形式の基本チェック
      new URL(articleUrl)
    } catch {
      setPreviewData(null)
      return
    }

    // サポート対象プラットフォームの事前チェック
    const supportedDomains = ['twitter.com', 'x.com', 'zenn.dev', 'qiita.com']
    const urlObj = new URL(articleUrl)
    const hostname = urlObj.hostname.toLowerCase().replace('www.', '')
    
    if (!supportedDomains.includes(hostname)) {
      setPreviewData(null)
      return
    }

    setIsPreviewLoading(true)

    try {
      const response = await fetch('/api/articles/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: articleUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewData(data.article)
      } else {
        setPreviewData(null)
      }
    } catch (error) {
      console.error('Preview fetch error:', error)
      setPreviewData(null)
    } finally {
      setIsPreviewLoading(false)
    }
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
      setPreviewData(null)

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
    <div className="space-y-8">
      {/* 記事追加フォーム */}
      <div className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📝</div>
          <h2 className="text-xl font-semibold text-foreground">記事を追加</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
              記事URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://zenn.dev/username/articles/article-title"
              className="w-full px-4 py-3 border border-border dark:border-gray-600 rounded-lg bg-background dark:bg-gray-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                対応プラットフォーム：
                <span className="font-medium text-primary">Twitter(X)</span>、
                <span className="font-medium text-primary">Zenn</span>、
                <span className="font-medium text-primary">Qiita</span>
              </p>
              <p className="text-xs text-muted-foreground">
                例：https://zenn.dev/author/articles/title
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                記事を取得中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">📚</span>
                記事を追加
              </div>
            )}
          </button>
        </form>

        {message && (
          <div className={`p-4 rounded-lg border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-l-green-400 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border-l-red-400 text-red-700 dark:text-red-300'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}
      </div>

      {/* プレビューセクション */}
      <div className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/60 rounded-2xl shadow-lg border border-border/50 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">👀</div>
          <h2 className="text-xl font-semibold text-foreground">プレビュー</h2>
          {isPreviewLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          )}
        </div>
        
        <ArticlePreview 
          article={previewData} 
          isLoading={isPreviewLoading}
          hasUrl={!!url.trim()}
        />
      </div>
    </div>
  )
}