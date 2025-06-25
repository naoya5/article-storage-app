"use client"

import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import Image from "next/image"
import { useState } from "react"
import { ArticleGenreSelector } from "./article-genre-selector"
import { ArticleTagSelector } from "./article-tag-selector"
import { ReadStatusSelector } from "./read-status-selector"
import { ReadStatus } from "@prisma/client"

interface Genre {
  id: string
  name: string
  color: string
}

interface ArticleGenre {
  id: string
  genreId: string
  genre: Genre
}

interface Tag {
  id: string
  name: string
}

interface ArticleTag {
  id: string
  tagId: string
  tag: Tag
}

interface Bookmark {
  id: string
  userId: string
  articleId: string
  isFavorite: boolean
  readStatus: ReadStatus
  rating?: number | null
  memo?: string | null
  createdAt: Date
}

interface Article {
  id: string
  title: string
  description?: string | null
  url: string
  platform: "TWITTER" | "ZENN" | "QIITA"
  author?: string | null
  publishedAt?: Date | null
  thumbnail?: string | null
  createdAt: Date
  articleGenres?: ArticleGenre[]
  articleTags?: ArticleTag[]
  bookmarks?: Bookmark[]
}

interface ArticleCardProps {
  article: Article
  onGenresChange?: () => void
  onTagsChange?: () => void
  onBookmarkChange?: () => void
}

const platformConfig = {
  TWITTER: {
    name: "Twitter",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50"
  },
  ZENN: {
    name: "Zenn",
    color: "bg-blue-600",
    textColor: "text-blue-700", 
    bgColor: "bg-blue-50"
  },
  QIITA: {
    name: "Qiita",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50"
  }
} as const

export function ArticleCard({ article, onGenresChange, onTagsChange, onBookmarkChange }: ArticleCardProps) {
  const platform = platformConfig[article.platform]
  const [imageError, setImageError] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  
  const isBookmarked = article.bookmarks && article.bookmarks.length > 0

  const handleBookmarkToggle = async () => {
    setBookmarkLoading(true)
    try {
      if (isBookmarked) {
        // ブックマーク削除
        const response = await fetch(`/api/bookmarks?articleId=${article.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('ブックマークの削除に失敗しました')
        }
      } else {
        // ブックマーク追加
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ articleId: article.id })
        })
        
        if (!response.ok) {
          throw new Error('ブックマークの追加に失敗しました')
        }
      }
      
      onBookmarkChange?.()
    } catch (error) {
      console.error('Bookmark error:', error)
      alert(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setBookmarkLoading(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* サムネイル */}
      {article.thumbnail && !imageError ? (
        <div className="aspect-video w-full overflow-hidden relative">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : article.thumbnail && imageError ? (
        <div className="aspect-video w-full overflow-hidden relative bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">画像を読み込めませんでした</p>
          </div>
        </div>
      ) : null}
      
      <div className="p-6">
        {/* プラットフォームバッジとブックマークボタン */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platform.textColor} ${platform.bgColor}`}>
            {platform.name}
          </span>
          <div className="flex items-center gap-2">
            {onBookmarkChange && (
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`p-1.5 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500'
                } disabled:opacity-50`}
                title={isBookmarked ? 'ブックマークを削除' : 'ブックマークに追加'}
              >
                <svg
                  className="w-4 h-4"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            )}
            <time className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(article.createdAt), { 
                addSuffix: true, 
                locale: ja 
              })}
            </time>
          </div>
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </a>
        </h3>

        {/* 説明 */}
        {article.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {article.description}
          </p>
        )}

        {/* ジャンル */}
        {onGenresChange && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">ジャンル</div>
            <ArticleGenreSelector
              articleId={article.id}
              currentGenres={article.articleGenres || []}
              onGenresChange={onGenresChange}
            />
          </div>
        )}

        {/* タグ */}
        {onTagsChange && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">タグ</div>
            <ArticleTagSelector
              articleId={article.id}
              currentTags={article.articleTags || []}
              onTagsChange={onTagsChange}
            />
          </div>
        )}

        {/* 読書ステータス */}
        {isBookmarked && article.bookmarks?.[0] && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">読書ステータス</div>
            <ReadStatusSelector
              bookmarkId={article.bookmarks[0].id}
              currentStatus={article.bookmarks[0].readStatus}
              onStatusChange={() => onBookmarkChange?.()}
            />
          </div>
        )}

        {/* 著者と公開日 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {article.author && (
            <span>by {article.author}</span>
          )}
          {article.publishedAt && (
            <span>
              {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}