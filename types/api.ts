import { ReadStatus, Platform } from "@prisma/client"

// API Response Types
export interface ApiResponse<T = any> {
  message?: string
  error?: string
  data?: T
}

// Article Types
export interface Article {
  id: string
  title: string
  description?: string | null
  url: string
  platform: Platform
  author?: string | null
  publishedAt?: Date | null
  thumbnail?: string | null
  createdAt: Date
  updatedAt: Date
  articleGenres?: ArticleGenre[]
  articleTags?: ArticleTag[]
  bookmarks?: Bookmark[]
}

export interface ArticleGenre {
  id: string
  genreId: string
  genre: Genre
}

export interface ArticleTag {
  id: string
  tagId: string
  tag: Tag
}

export interface Genre {
  id: string
  name: string
  color: string
}

export interface Tag {
  id: string
  name: string
}

export interface Bookmark {
  id: string
  userId: string
  articleId: string
  isFavorite: boolean
  readStatus: ReadStatus
  rating?: number | null
  memo?: string | null
  createdAt: Date
  updatedAt: Date
}

// API Request/Response Types
export interface ArticleListParams {
  page?: number
  limit?: number
  query?: string
  platform?: string
  genreId?: string
  tagId?: string
  dateFrom?: string
  dateTo?: string
}

export interface ArticleListResponse {
  articles: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface BookmarkCreateRequest {
  articleId: string
}

export interface BookmarkUpdateRequest {
  readStatus?: ReadStatus
  isFavorite?: boolean
  rating?: number | null
  memo?: string | null
}

export interface GenreRequest {
  name: string
  color: string
}

export interface TagRequest {
  name: string
}

// Search Filter Types
export interface SearchFilters {
  query: string
  platform: string
  genreId: string
  tagId: string
  dateFrom: string
  dateTo: string
}