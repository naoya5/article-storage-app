import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/stats/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { Platform, ReadStatus } from '@prisma/client'

// モック
vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    bookmark: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    genre: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    tag: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  }
}))

const mockGetServerSession = vi.mocked(getServerSession)
const mockPrisma = vi.mocked(prisma)

describe('Stats API Tests', () => {
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

  it('returns comprehensive stats for authenticated user', async () => {
    // モックデータ設定
    mockPrisma.article.count
      .mockResolvedValueOnce(100) // totalArticles
      .mockResolvedValueOnce(15)  // monthlyArticles
      .mockResolvedValueOnce(5)   // weeklyArticles

    mockPrisma.bookmark.count
      .mockResolvedValueOnce(75)  // totalBookmarks
      .mockResolvedValueOnce(30)  // favoriteCount

    mockPrisma.genre.count.mockResolvedValue(8)
    mockPrisma.tag.count.mockResolvedValue(12)

    // プラットフォーム別統計
    mockPrisma.article.groupBy.mockResolvedValueOnce([
      { platform: Platform.TWITTER, _count: { platform: 50 } },
      { platform: Platform.ZENN, _count: { platform: 30 } },
      { platform: Platform.QIITA, _count: { platform: 20 } }
    ])

    // 読書ステータス別統計
    mockPrisma.bookmark.groupBy
      .mockResolvedValueOnce([
        { readStatus: ReadStatus.UNREAD, _count: { readStatus: 40 } },
        { readStatus: ReadStatus.READ, _count: { readStatus: 25 } },
        { readStatus: ReadStatus.READ_LATER, _count: { readStatus: 10 } }
      ])
      .mockResolvedValueOnce([
        { rating: 5, _count: { rating: 15 } },
        { rating: 4, _count: { rating: 20 } },
        { rating: 3, _count: { rating: 10 } }
      ])

    // ジャンル統計
    mockPrisma.genre.findMany.mockResolvedValue([
      {
        id: 'genre-1',
        name: 'React',
        color: '#61DAFB',
        articleGenres: [{}, {}, {}] // 3 articles
      },
      {
        id: 'genre-2', 
        name: 'TypeScript',
        color: '#3178C6',
        articleGenres: [{}, {}] // 2 articles
      }
    ])

    // タグ統計
    mockPrisma.tag.findMany.mockResolvedValue([
      {
        id: 'tag-1',
        name: 'frontend',
        articleTags: [{}, {}, {}, {}] // 4 articles
      },
      {
        id: 'tag-2',
        name: 'backend', 
        articleTags: [{}] // 1 article
      }
    ])

    // 最近の活動
    mockPrisma.article.findMany.mockResolvedValue([
      { createdAt: new Date('2024-01-15T10:00:00Z') },
      { createdAt: new Date('2024-01-15T14:00:00Z') },
      { createdAt: new Date('2024-01-14T09:00:00Z') }
    ])

    const request = new NextRequest('http://localhost:3000/api/stats')
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)

    // 基本統計
    expect(data.basic).toEqual({
      totalArticles: 100,
      totalBookmarks: 75,
      totalGenres: 8,
      totalTags: 12,
      monthlyArticles: 15,
      weeklyArticles: 5,
      favoriteRate: 40 // (30/75) * 100
    })

    // プラットフォーム統計
    expect(data.platforms).toEqual([
      { platform: Platform.TWITTER, count: 50 },
      { platform: Platform.ZENN, count: 30 },
      { platform: Platform.QIITA, count: 20 }
    ])

    // 読書ステータス統計
    expect(data.readStatus).toEqual([
      { status: ReadStatus.UNREAD, count: 40 },
      { status: ReadStatus.READ, count: 25 },
      { status: ReadStatus.READ_LATER, count: 10 }
    ])

    // 評価統計
    expect(data.ratings).toEqual([
      { rating: 5, count: 15 },
      { rating: 4, count: 20 },
      { rating: 3, count: 10 }
    ])

    // ジャンル統計
    expect(data.genres).toEqual([
      { id: 'genre-1', name: 'React', color: '#61DAFB', count: 3 },
      { id: 'genre-2', name: 'TypeScript', color: '#3178C6', count: 2 }
    ])

    // タグ統計
    expect(data.tags).toEqual([
      { id: 'tag-1', name: 'frontend', count: 4 },
      { id: 'tag-2', name: 'backend', count: 1 }
    ])

    // 活動統計
    expect(data.activity).toEqual({
      '2024-01-15': 2,
      '2024-01-14': 1
    })
  })

  it('handles case with no bookmarks', async () => {
    // ブックマークがない場合
    mockPrisma.article.count
      .mockResolvedValueOnce(50)  // totalArticles
      .mockResolvedValueOnce(10)  // monthlyArticles  
      .mockResolvedValueOnce(3)   // weeklyArticles

    mockPrisma.bookmark.count.mockResolvedValue(0)
    mockPrisma.genre.count.mockResolvedValue(5)
    mockPrisma.tag.count.mockResolvedValue(8)

    mockPrisma.article.groupBy.mockResolvedValue([
      { platform: Platform.TWITTER, _count: { platform: 50 } }
    ])

    mockPrisma.bookmark.groupBy
      .mockResolvedValueOnce([])  // readStatus
      .mockResolvedValueOnce([])  // ratings

    mockPrisma.genre.findMany.mockResolvedValue([])
    mockPrisma.tag.findMany.mockResolvedValue([])
    mockPrisma.article.findMany.mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.basic.favoriteRate).toBe(0)
    expect(data.readStatus).toEqual([])
    expect(data.ratings).toEqual([])
    expect(data.activity).toEqual({})
  })

  it('requires authentication', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('認証が必要です')
  })

  it('handles database errors gracefully', async () => {
    mockPrisma.article.count.mockRejectedValue(new Error('Database error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('統計の取得に失敗しました')
  })

  it('calculates percentages correctly', async () => {
    // 割り切れない数での割合計算テスト
    mockPrisma.article.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(3)

    mockPrisma.bookmark.count
      .mockResolvedValueOnce(33) // totalBookmarks
      .mockResolvedValueOnce(10) // favoriteCount

    mockPrisma.genre.count.mockResolvedValue(0)
    mockPrisma.tag.count.mockResolvedValue(0)
    
    mockPrisma.article.groupBy.mockResolvedValue([])
    mockPrisma.bookmark.groupBy.mockResolvedValue([]).mockResolvedValue([])
    mockPrisma.genre.findMany.mockResolvedValue([])
    mockPrisma.tag.findMany.mockResolvedValue([])
    mockPrisma.article.findMany.mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    // (10/33) * 100 = 30.30... → 30 (四捨五入)
    expect(data.basic.favoriteRate).toBe(30)
  })

  it('correctly groups activity by date', async () => {
    mockPrisma.article.count.mockResolvedValue(0)
    mockPrisma.bookmark.count.mockResolvedValue(0)
    mockPrisma.genre.count.mockResolvedValue(0)
    mockPrisma.tag.count.mockResolvedValue(0)
    mockPrisma.article.groupBy.mockResolvedValue([])
    mockPrisma.bookmark.groupBy.mockResolvedValue([]).mockResolvedValue([])
    mockPrisma.genre.findMany.mockResolvedValue([])
    mockPrisma.tag.findMany.mockResolvedValue([])

    // 同じ日の複数記事、異なる日の記事をテスト
    mockPrisma.article.findMany.mockResolvedValue([
      { createdAt: new Date('2024-01-15T10:00:00Z') },
      { createdAt: new Date('2024-01-15T14:00:00Z') },
      { createdAt: new Date('2024-01-15T20:00:00Z') },
      { createdAt: new Date('2024-01-14T09:00:00Z') },
      { createdAt: new Date('2024-01-13T15:00:00Z') }
    ])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activity).toEqual({
      '2024-01-15': 3,
      '2024-01-14': 1,
      '2024-01-13': 1
    })
  })
})