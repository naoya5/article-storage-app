import { SearchBar } from "../search-bar"
import type { SearchFilters, Genre, Tag } from "@/types/api"

interface EmptyStateProps {
  hasSearchFilters: boolean
  searchLoading: boolean
  availableTags: Tag[]
  availableGenres: Genre[]
  onSearch: (filters: SearchFilters) => void
}

export function EmptyState({ 
  hasSearchFilters, 
  searchLoading, 
  availableTags, 
  availableGenres, 
  onSearch 
}: EmptyStateProps) {
  return (
    <div>
      <SearchBar
        onSearch={onSearch}
        loading={searchLoading}
        availableTags={availableTags}
        availableGenres={availableGenres}
      />
      
      <div className="text-center py-12 text-gray-600">
        {hasSearchFilters ? (
          <div>
            <div className="mb-4">検索条件に一致する記事が見つかりませんでした</div>
            <div className="text-sm">検索条件を変更してお試しください</div>
          </div>
        ) : (
          <div>
            <div className="mb-4">まだ記事が登録されていません</div>
            <div className="text-sm">記事を追加してお試しください！</div>
          </div>
        )}
      </div>
    </div>
  )
}