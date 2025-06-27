"use client"

import { ArticleCard } from "../article-card"
import type { Article } from "@/types/api"

interface ArticleGridProps {
  articles: Article[]
  onArticleChange: () => void
}

export function ArticleGrid({ articles, onArticleChange }: ArticleGridProps) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard 
          key={article.id} 
          article={article} 
          onGenresChange={onArticleChange}
          onTagsChange={onArticleChange}
          onBookmarkChange={onArticleChange}
        />
      ))}
    </div>
  )
}