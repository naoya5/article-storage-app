interface StatsDashboardProps {
  stats: StatsData | null
}

interface StatsData {
  basic: {
    totalArticles: number
    totalBookmarks: number
    totalGenres: number
    totalTags: number
    monthlyArticles: number
    weeklyArticles: number
    favoriteRate: number
  }
  platforms: Array<{
    platform: string
    count: number
  }>
  readStatus: Array<{
    status: string
    count: number
  }>
  ratings: Array<{
    rating: number
    count: number
  }>
  genres: Array<{
    id: string
    name: string
    color: string
    count: number
  }>
  tags: Array<{
    id: string
    name: string
    count: number
  }>
  activity: Record<string, number>
}

const platformConfig = {
  TWITTER: { name: 'Twitter', color: '#1DA1F2' },
  ZENN: { name: 'Zenn', color: '#3EA8FF' },
  QIITA: { name: 'Qiita', color: '#55C500' }
}

const readStatusConfig = {
  UNREAD: { name: '未読', color: '#6B7280' },
  READ: { name: '読了', color: '#10B981' },
  READ_LATER: { name: '後で読む', color: '#3B82F6' }
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">統計データがありません</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 基本統計 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">基本統計</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.basic.totalArticles}</div>
            <div className="text-xs sm:text-sm text-gray-600">総記事数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.basic.totalBookmarks}</div>
            <div className="text-xs sm:text-sm text-gray-600">ブックマーク</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.basic.totalGenres}</div>
            <div className="text-xs sm:text-sm text-gray-600">ジャンル</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.basic.totalTags}</div>
            <div className="text-xs sm:text-sm text-gray-600">タグ</div>
          </div>
        </div>
      </div>

      {/* 期間別統計 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">期間別追加数</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-lg font-semibold text-gray-900">{stats.basic.weeklyArticles}</div>
            <div className="text-sm text-gray-600">今週</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-lg font-semibold text-gray-900">{stats.basic.monthlyArticles}</div>
            <div className="text-sm text-gray-600">今月</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-lg font-semibold text-gray-900">{stats.basic.favoriteRate}%</div>
            <div className="text-sm text-gray-600">お気に入り率</div>
          </div>
        </div>
      </div>

      {/* プラットフォーム別統計 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">プラットフォーム別</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-3">
            {stats.platforms.map((platform) => {
              const config = platformConfig[platform.platform as keyof typeof platformConfig]
              const percentage = stats.basic.totalArticles > 0 
                ? Math.round((platform.count / stats.basic.totalArticles) * 100)
                : 0
              
              return (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-sm font-medium">{config.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: config.color,
                          width: `${percentage}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {platform.count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 読書ステータス */}
      {stats.readStatus.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">読書ステータス</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              {stats.readStatus.map((status) => {
                const config = readStatusConfig[status.status as keyof typeof readStatusConfig]
                const percentage = stats.basic.totalBookmarks > 0 
                  ? Math.round((status.count / stats.basic.totalBookmarks) * 100)
                  : 0
                
                return (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-sm font-medium">{config.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: config.color,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {status.count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 評価分布 */}
      {stats.ratings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">評価分布</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingData = stats.ratings.find(r => r.rating === rating)
                const count = ratingData ? ratingData.count : 0
                const totalRatings = stats.ratings.reduce((sum, r) => sum + r.count, 0)
                const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
                
                return (
                  <div key={rating} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex">
                        {Array.from({ length: rating }, (_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 人気ジャンル */}
      {stats.genres.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">人気ジャンル（上位10位）</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-3">
              {stats.genres.map((genre, index) => (
                <div key={genre.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 w-6">#{index + 1}</span>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: genre.color }}
                    />
                    <span className="text-sm font-medium">{genre.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{genre.count}記事</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 人気タグ */}
      {stats.tags.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">人気タグ（上位10位）</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.tags.map((tag, index) => (
                <div key={tag.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium">#{tag.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{tag.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}