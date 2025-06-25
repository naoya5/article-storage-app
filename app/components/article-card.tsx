"use client"

import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import Image from "next/image"
import { ArticleGenreSelector } from "./article-genre-selector"
import { ArticleTagSelector } from "./article-tag-selector"

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
}

interface ArticleCardProps {
  article: Article
  onGenresChange?: () => void
  onTagsChange?: () => void
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

export function ArticleCard({ article, onGenresChange, onTagsChange }: ArticleCardProps) {
  const platform = platformConfig[article.platform]
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* サムネイル */}
      {article.thumbnail && (
        <div className="aspect-video w-full overflow-hidden relative">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* プラットフォームバッジ */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platform.textColor} ${platform.bgColor}`}>
            {platform.name}
          </span>
          <time className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(article.createdAt), { 
              addSuffix: true, 
              locale: ja 
            })}
          </time>
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