import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/articles/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { Platform } from '@prisma/client'

// モック
vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: vi.fn(),
      count: vi.fn(),
    }
  }
}))

const mockGetServerSession = vi.mocked(getServerSession)
const mockPrisma = vi.mocked(prisma)

describe('Filter API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // デフォルトの認証セッション
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('filters articles by platform', async () => {
    // モックデータ
    const mockArticles = [
      {
        id: '1',
        title: 'Twitter Article',
        url: 'https://twitter.com/user/status/123',
        platform: Platform.TWITTER,
        userId: 'user-1',
        createdAt: new Date(),
        articleGenres: [],
        articleTags: [],
        bookmarks: []
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)
    mockPrisma.article.count.mockResolvedValue(1)

    // プラットフォームフィルターでリクエスト
    const url = new URL('http://localhost:3000/api/articles?platform=TWITTER&page=1&limit=10')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.articles).toHaveLength(1)
    expect(data.articles[0].id).toBe('1')
    expect(data.articles[0].platform).toBe(Platform.TWITTER)
    
    // Prismaクエリが正しい条件で呼ばれているかチェック
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        platform: Platform.TWITTER
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
      include: {
        articleGenres: {
          include: { genre: true }
        },
        articleTags: {
          include: { tag: true }
        },
        bookmarks: {
          where: { userId: 'user-1' }
        }
      }
    })
  })

  it('filters articles by genre', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'React Article',
        url: 'https://example.com/react',
        platform: Platform.ZENN,
        userId: 'user-1',
        createdAt: new Date(),
        articleGenres: [{ genreId: 'genre-1', genre: { name: 'React' } }],
        articleTags: [],
        bookmarks: []
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)
    mockPrisma.article.count.mockResolvedValue(1)

    // ジャンルフィルターでリクエスト
    const url = new URL('http://localhost:3000/api/articles?genreId=genre-1&page=1&limit=10')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.articles).toHaveLength(1)
    expect(data.articles[0].id).toBe('1')
    expect(data.articles[0].platform).toBe(Platform.ZENN)
    
    // Prismaクエリが正しい条件で呼ばれているかチェック
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        articleGenres: {
          some: { genreId: 'genre-1' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
      include: {
        articleGenres: {
          include: { genre: true }
        },
        articleTags: {
          include: { tag: true }
        },
        bookmarks: {
          where: { userId: 'user-1' }
        }
      }
    })
  })

  it('filters articles by tag', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Frontend Article',
        url: 'https://example.com/frontend',
        platform: Platform.QIITA,
        userId: 'user-1',
        createdAt: new Date(),
        articleGenres: [],
        articleTags: [{ tagId: 'tag-1', tag: { name: 'frontend' } }],
        bookmarks: []
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)
    mockPrisma.article.count.mockResolvedValue(1)

    // タグフィルターでリクエスト
    const url = new URL('http://localhost:3000/api/articles?tagId=tag-1&page=1&limit=10')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.articles).toHaveLength(1)
    expect(data.articles[0].id).toBe('1')
    expect(data.articles[0].platform).toBe(Platform.QIITA)
    
    // Prismaクエリが正しい条件で呼ばれているかチェック
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        articleTags: {
          some: { tagId: 'tag-1' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
      include: {
        articleGenres: {
          include: { genre: true }
        },
        articleTags: {
          include: { tag: true }
        },
        bookmarks: {
          where: { userId: 'user-1' }
        }
      }
    })
  })

  it('filters articles by date range', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Recent Article',
        url: 'https://example.com/recent',
        platform: Platform.ZENN,
        userId: 'user-1',
        createdAt: new Date('2024-01-15'),
        articleGenres: [],
        articleTags: [],
        bookmarks: []
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)
    mockPrisma.article.count.mockResolvedValue(1)

    // 日付範囲フィルターでリクエスト
    const url = new URL('http://localhost:3000/api/articles?dateFrom=2024-01-01&dateTo=2024-01-31&page=1&limit=10')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.articles).toHaveLength(1)
    expect(data.articles[0].id).toBe('1')
    expect(data.articles[0].platform).toBe(Platform.ZENN)
    
    // Prismaクエリが正しい条件で呼ばれているかチェック
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        createdAt: {
          gte: new Date('2024-01-01'),
          lte: new Date(new Date('2024-01-31').getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
      include: {
        articleGenres: {
          include: { genre: true }
        },
        articleTags: {
          include: { tag: true }
        },
        bookmarks: {
          where: { userId: 'user-1' }
        }
      }
    })
  })

  it('combines multiple filters', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'React Twitter Article',
        url: 'https://twitter.com/user/status/123',
        platform: Platform.TWITTER,
        userId: 'user-1',
        createdAt: new Date('2024-01-15'),
        articleGenres: [{ genreId: 'genre-1', genre: { name: 'React' } }],
        articleTags: [{ tagId: 'tag-1', tag: { name: 'frontend' } }],
        bookmarks: []
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)
    mockPrisma.article.count.mockResolvedValue(1)

    // 複数フィルターでリクエスト
    const url = new URL('http://localhost:3000/api/articles?platform=TWITTER&genreId=genre-1&tagId=tag-1&query=React&page=1&limit=10')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.articles).toHaveLength(1)
    expect(data.articles[0].id).toBe('1')
    expect(data.articles[0].title).toBe('React Twitter Article')
    
    // Prismaクエリが正しい条件で呼ばれているかチェック
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        platform: Platform.TWITTER,
        OR: [
          { title: { contains: 'React', mode: 'insensitive' } },
          { description: { contains: 'React', mode: 'insensitive' } },
          { content: { contains: 'React', mode: 'insensitive' } },
          { author: { contains: 'React', mode: 'insensitive' } }
        ],
        articleGenres: {
          some: { genreId: 'genre-1' }
        },
        articleTags: {
          some: { tagId: 'tag-1' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
      include: {
        articleGenres: {
          include: { genre: true }
        },
        articleTags: {
          include: { tag: true }
        },
        bookmarks: {
          where: { userId: 'user-1' }
        }
      }
    })
  })

  it('returns empty array when no filters match', async () => {
    mockPrisma.article.findMany.mockResolvedValue([])
    mockPrisma.article.count.mockResolvedValue(0)

    const url = new URL('http://localhost:3000/api/articles?platform=TWITTER&query=NonExistent&page=1&limit=10')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.articles).toEqual([])
    expect(data.pagination.total).toBe(0)
  })

  it('requires authentication', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const url = new URL('http://localhost:3000/api/articles?platform=TWITTER')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('認証が必要です')
  })
})