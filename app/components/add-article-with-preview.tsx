"use client"

import { useState } from "react"
import { AddArticleForm } from "./add-article-form"
import { ArticleCard } from "./article-card"
import type { Article } from "@/types/api"

/**
 * A composite component that displays the AddArticleForm and, after a successful
 * submission, renders a preview of the newly added article beneath the form.
 */
export function AddArticleWithPreview() {
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)

  const handleArticleAdded = (article: Article) => {
    setPreviewArticle(article)
  }

  return (
    <div className="space-y-8">
      {/* Article submission form */}
      <AddArticleForm onArticleAdded={handleArticleAdded} />

      {/* Live preview */}
      {previewArticle && (
        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-card-foreground">
            プレビュー
          </h2>
          <ArticleCard article={previewArticle} />
        </div>
      )}
    </div>
  )
}