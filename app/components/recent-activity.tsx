import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import type { Article } from "@/types/api"

interface RecentActivityProps {
  articles: Article[]
  limit?: number
}

export function RecentActivity({ articles, limit = 10 }: RecentActivityProps) {
  const recentArticles = articles.slice(0, limit)

  const platformConfig = {
    TWITTER: { name: 'Twitter', color: 'bg-blue-100 text-blue-800' },
    ZENN: { name: 'Zenn', color: 'bg-blue-100 text-blue-800' },
    QIITA: { name: 'Qiita', color: 'bg-green-100 text-green-800' }
  }


  if (recentArticles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        まだ記事が登録されていません
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentArticles.map((article) => {
        const platform = platformConfig[article.platform]
        const isBookmarked = article.bookmarks && article.bookmarks.length > 0
        
        return (
          <div key={article.id} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            {/* サムネイルまたはプラットフォームアイコン */}
            <div className="flex-shrink-0">
              {article.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 rounded flex items-center justify-center text-xs font-medium ${platform.color} ${article.thumbnail ? 'hidden' : ''}`}>
                {platform.name}
              </div>
            </div>

            {/* 記事情報 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </a>
                  </h3>
                  
                  {article.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {article.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {article.author && (
                      <span>by {article.author}</span>
                    )}
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(article.createdAt), { 
                        addSuffix: true, 
                        locale: ja 
                      })}
                    </span>
                  </div>
                </div>

                {/* ブックマークアイコン */}
                {isBookmarked && (
                  <div className="flex-shrink-0 ml-2">
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* ジャンル・タグ表示 */}
              {(article.articleGenres?.length || article.articleTags?.length) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.articleGenres?.slice(0, 2).map((articleGenre) => (
                    <span
                      key={articleGenre.genre.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${articleGenre.genre.color}20`,
                        color: articleGenre.genre.color
                      }}
                    >
                      {articleGenre.genre.name}
                    </span>
                  ))}
                  {article.articleTags?.slice(0, 2).map((articleTag) => (
                    <span
                      key={articleTag.tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      #{articleTag.tag.name}
                    </span>
                  ))}
                  {(article.articleGenres?.length || 0) + (article.articleTags?.length || 0) > 4 && (
                    <span className="text-xs text-gray-400">+{(article.articleGenres?.length || 0) + (article.articleTags?.length || 0) - 4}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}