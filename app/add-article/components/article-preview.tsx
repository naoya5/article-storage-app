"use client"

import Image from "next/image"
import Link from "next/link"

interface Article {
  title: string
  description: string
  url: string
  author: string
  platform: string
  publishedAt: string
  imageUrl?: string
}

interface ArticlePreviewProps {
  article: Article | null
  isLoading: boolean
  hasUrl: boolean
}

export function ArticlePreview({ article, isLoading, hasUrl }: ArticlePreviewProps) {
  if (!hasUrl) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium mb-2">記事URLを入力してください</h3>
        <p className="text-sm">URLを入力すると、ここにリアルタイムプレビューが表示されます</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-foreground mb-2">記事情報を取得中...</h3>
        <p className="text-sm text-muted-foreground">しばらくお待ちください</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium mb-2">記事が見つかりません</h3>
        <p className="text-sm">
          有効なTwitter(X)、Zenn、QiitaのURLを入力してください
        </p>
      </div>
    )
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return '🐦'
      case 'zenn':
        return '📘'
      case 'qiita':
        return '📗'
      default:
        return '📄'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'zenn':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      case 'qiita':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="bg-background dark:bg-gray-900 border border-border dark:border-gray-600 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 記事画像 */}
        {article.imageUrl && (
          <div className="flex-shrink-0">
            <div className="relative w-full md:w-48 h-32 md:h-32 rounded-lg overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 200px"
              />
            </div>
          </div>
        )}

        {/* 記事情報 */}
        <div className="flex-1 min-w-0">
          {/* プラットフォームとメタ情報 */}
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(article.platform)}`}>
              <span className="mr-1">{getPlatformIcon(article.platform)}</span>
              {article.platform}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(article.publishedAt)}
            </span>
          </div>

          {/* タイトル */}
          <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
            {article.title}
          </h3>

          {/* 説明 */}
          {article.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {article.description}
            </p>
          )}

          {/* 著者とリンク */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                👤 {article.author}
              </span>
            </div>
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <span className="mr-1">🔗</span>
              元記事を開く
            </Link>
          </div>
        </div>
      </div>

      {/* 追加予定の情報バー */}
      <div className="mt-6 pt-4 border-t border-border dark:border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            ✅ この記事がストックに追加されます
          </span>
          <span className="text-primary font-medium">
            プレビュー表示中
          </span>
        </div>
      </div>
    </div>
  )
}