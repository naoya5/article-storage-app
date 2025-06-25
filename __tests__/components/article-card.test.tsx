import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ArticleCard } from '@/app/components/article-card'

// Mock fetch
global.fetch = vi.fn()

const mockArticle = {
  id: 'article1',
  title: 'Test Article',
  description: 'Test description',
  url: 'https://example.com/article',
  platform: 'TWITTER' as const,
  author: 'Test Author',
  publishedAt: new Date('2024-01-01'),
  thumbnail: 'https://example.com/thumbnail.jpg',
  createdAt: new Date('2024-01-02'),
  articleGenres: [],
  articleTags: [],
  bookmarks: []
}

const mockBookmarkedArticle = {
  ...mockArticle,
  bookmarks: [{
    id: 'bookmark1',
    userId: 'user1',
    articleId: 'article1',
    createdAt: new Date()
  }]
}

describe('ArticleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render article information correctly', () => {
    render(<ArticleCard article={mockArticle} />)
    
    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('by Test Author')).toBeInTheDocument()
    expect(screen.getByText('Twitter')).toBeInTheDocument()
  })

  it('should show bookmark button when onBookmarkChange is provided', () => {
    const onBookmarkChange = vi.fn()
    render(<ArticleCard article={mockArticle} onBookmarkChange={onBookmarkChange} />)
    
    const bookmarkButton = screen.getByTitle('ブックマークに追加')
    expect(bookmarkButton).toBeInTheDocument()
  })

  it('should not show bookmark button when onBookmarkChange is not provided', () => {
    render(<ArticleCard article={mockArticle} />)
    
    expect(screen.queryByTitle('ブックマークに追加')).not.toBeInTheDocument()
    expect(screen.queryByTitle('ブックマークを削除')).not.toBeInTheDocument()
  })

  it('should show bookmarked state when article is bookmarked', () => {
    const onBookmarkChange = vi.fn()
    render(<ArticleCard article={mockBookmarkedArticle} onBookmarkChange={onBookmarkChange} />)
    
    const bookmarkButton = screen.getByTitle('ブックマークを削除')
    expect(bookmarkButton).toBeInTheDocument()
  })

  it('should handle bookmark addition', async () => {
    const onBookmarkChange = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ブックマークに追加しました' })
    } as Response)

    render(<ArticleCard article={mockArticle} onBookmarkChange={onBookmarkChange} />)
    
    const bookmarkButton = screen.getByTitle('ブックマークに追加')
    fireEvent.click(bookmarkButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ articleId: 'article1' })
      })
      expect(onBookmarkChange).toHaveBeenCalled()
    })
  })

  it('should handle bookmark removal', async () => {
    const onBookmarkChange = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ブックマークを削除しました' })
    } as Response)

    render(<ArticleCard article={mockBookmarkedArticle} onBookmarkChange={onBookmarkChange} />)
    
    const bookmarkButton = screen.getByTitle('ブックマークを削除')
    fireEvent.click(bookmarkButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/bookmarks?articleId=article1', {
        method: 'DELETE'
      })
      expect(onBookmarkChange).toHaveBeenCalled()
    })
  })

  it('should handle bookmark error', async () => {
    const onBookmarkChange = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response)

    render(<ArticleCard article={mockArticle} onBookmarkChange={onBookmarkChange} />)
    
    const bookmarkButton = screen.getByTitle('ブックマークに追加')
    fireEvent.click(bookmarkButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('ブックマークの追加に失敗しました')
      expect(onBookmarkChange).not.toHaveBeenCalled()
    })

    alertSpy.mockRestore()
  })

  it('should disable bookmark button while loading', async () => {
    const onBookmarkChange = vi.fn()
    let resolvePromise: (value: any) => void
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    
    vi.mocked(fetch).mockReturnValueOnce(promise as any)

    render(<ArticleCard article={mockArticle} onBookmarkChange={onBookmarkChange} />)
    
    const bookmarkButton = screen.getByTitle('ブックマークに追加')
    fireEvent.click(bookmarkButton)

    expect(bookmarkButton).toBeDisabled()

    resolvePromise!({
      ok: true,
      json: async () => ({ message: 'success' })
    })

    await waitFor(() => {
      expect(bookmarkButton).not.toBeDisabled()
    })
  })
})