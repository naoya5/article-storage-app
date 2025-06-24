/**
 * 記事一覧表示機能のテスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ArticleList } from '@/app/components/article-list'
import { ArticleCard } from '@/app/components/article-card'

// fetch をモック
global.fetch = vi.fn()

describe('ArticleList Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  test('Shows loading state initially', () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        articles: [],
        pagination: { page: 1, limit: 6, total: 0, pages: 0 }
      })
    } as Response)

    render(<ArticleList />)
    
    const loadingSpinner = document.querySelector('.animate-spin')
    expect(loadingSpinner).toBeDefined()
  })

  test('Shows empty state when no articles', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        articles: [],
        pagination: { page: 1, limit: 6, total: 0, pages: 0 }
      })
    } as Response)

    render(<ArticleList />)
    
    await waitFor(() => {
      expect(screen.getByText('まだ記事が登録されていません')).toBeDefined()
    })
  })

  test('Shows error state on fetch failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500
    } as Response)

    render(<ArticleList />)
    
    await waitFor(() => {
      expect(screen.getByText('記事の取得に失敗しました')).toBeDefined()
    })
  })

  test('Shows authentication error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401
    } as Response)

    render(<ArticleList />)
    
    await waitFor(() => {
      expect(screen.getByText('認証が必要です')).toBeDefined()
    })
  })

  test('Renders articles correctly', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article 1',
        description: 'Test description',
        url: 'https://zenn.dev/test/articles/test-1',
        platform: 'ZENN' as const,
        author: 'Test Author',
        publishedAt: new Date('2023-12-01'),
        thumbnail: 'https://example.com/image.jpg',
        createdAt: new Date('2023-12-01')
      }
    ]

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        articles: mockArticles,
        pagination: { page: 1, limit: 6, total: 1, pages: 1 }
      })
    } as Response)

    render(<ArticleList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeDefined()
    })
  })

  test('Shows pagination when multiple pages', async () => {
    const mockArticles = Array.from({ length: 6 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Test Article ${i + 1}`,
      url: `https://zenn.dev/test/articles/test-${i + 1}`,
      platform: 'ZENN' as const,
      createdAt: new Date()
    }))

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        articles: mockArticles,
        pagination: { page: 1, limit: 6, total: 12, pages: 2 }
      })
    } as Response)

    render(<ArticleList />)
    
    await waitFor(() => {
      expect(screen.getByText('次へ')).toBeDefined()
      expect(screen.getByText('2')).toBeDefined()
    })
  })

  test('Refreshes when refreshKey changes', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        articles: [],
        pagination: { page: 1, limit: 6, total: 0, pages: 0 }
      })
    } as Response)

    const { rerender } = render(<ArticleList refreshKey={1} />)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    rerender(<ArticleList refreshKey={2} />)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})

describe('ArticleCard Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  const mockArticle = {
    id: '1',
    title: 'Test Article',
    description: 'Test description for the article',
    url: 'https://zenn.dev/test/articles/test',
    platform: 'ZENN' as const,
    author: 'Test Author',
    publishedAt: new Date('2023-12-01'),
    thumbnail: 'https://example.com/image.jpg',
    createdAt: new Date('2023-12-01')
  }

  test('Renders article information correctly', () => {
    const { container } = render(<ArticleCard article={mockArticle} />)
    
    expect(container.textContent).toContain('Test Article')
    expect(container.textContent).toContain('Test description for the article')
    expect(container.textContent).toContain('by Test Author')
    expect(container.textContent).toContain('Zenn')
  })

  test('Renders external link correctly', () => {
    const { container } = render(<ArticleCard article={mockArticle} />)
    
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe(mockArticle.url)
    expect(link?.getAttribute('target')).toBe('_blank')
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  test('Shows thumbnail when available', () => {
    const { container } = render(<ArticleCard article={mockArticle} />)
    
    const image = container.querySelector('img')
    expect(image?.getAttribute('alt')).toBe(mockArticle.title)
    expect(image).toBeDefined()
  })

  test('Handles missing optional fields', () => {
    const minimalArticle = {
      id: '1',
      title: 'Minimal Article',
      url: 'https://twitter.com/user/status/123',
      platform: 'TWITTER' as const,
      createdAt: new Date('2023-12-01')
    }

    const { container } = render(<ArticleCard article={minimalArticle} />)
    
    expect(container.textContent).toContain('Minimal Article')
    expect(container.textContent).toContain('Twitter')
  })

  test('Shows different platform styles', () => {
    const platforms = ['TWITTER', 'ZENN', 'QIITA'] as const
    
    platforms.forEach((platform, index) => {
      document.body.innerHTML = ''
      const article = { ...mockArticle, platform, id: `test-${index}` }
      const { container } = render(<ArticleCard article={article} />)
      
      expect(container.textContent).toContain(
        platform === 'TWITTER' ? 'Twitter' : 
        platform === 'ZENN' ? 'Zenn' : 'Qiita'
      )
    })
  })
})