/**
 * ジャンル管理API のテスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'

// モジュールをモック
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    genre: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    articleGenre: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    article: {
      findFirst: vi.fn(),
    },
  },
}))

describe('Genre API Tests', () => {
  let mockGetServerSession: any
  let mockPrisma: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    const nextAuth = await import('next-auth')
    const prismaModule = await import('@/lib/prisma')
    
    mockGetServerSession = vi.mocked(nextAuth.getServerSession)
    mockPrisma = vi.mocked(prismaModule.prisma)
  })

  describe('GET /api/genres', () => {
    test('Returns genres for authenticated user', async () => {
      // セッションをモック
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      // Prismaのレスポンスをモック
      const mockGenres = [
        {
          id: '1',
          name: 'プログラミング',
          description: 'プログラミング関連',
          color: '#3B82F6',
          userId: 'user1',
          articleGenres: [
            { article: { id: 'article1' } },
            { article: { id: 'article2' } }
          ]
        }
      ]

      mockPrisma.genre.findMany.mockResolvedValue(mockGenres)

      const { GET } = await import('@/app/api/genres/route')
      const request = new Request('http://localhost/api/genres')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.genres).toHaveLength(1)
      expect(data.genres[0].articleCount).toBe(2)
      expect(mockPrisma.genre.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { name: 'asc' },
        include: {
          articleGenres: {
            include: { article: true }
          }
        }
      })
    })

    test('Returns 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { GET } = await import('@/app/api/genres/route')
      const request = new Request('http://localhost/api/genres')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/genres', () => {
    test('Creates genre successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      mockPrisma.genre.findFirst.mockResolvedValue(null) // 重複なし
      mockPrisma.genre.create.mockResolvedValue({
        id: 'genre1',
        name: 'テストジャンル',
        description: 'テスト説明',
        color: '#3B82F6',
        userId: 'user1',
        createdAt: new Date('2023-12-01')
      })

      const { POST } = await import('@/app/api/genres/route')
      const request = new Request('http://localhost/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'テストジャンル',
          description: 'テスト説明',
          color: '#3B82F6'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('ジャンルが正常に作成されました')
      expect(data.genre.name).toBe('テストジャンル')
    })

    test('Returns 400 for missing name', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      const { POST } = await import('@/app/api/genres/route')
      const request = new Request('http://localhost/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'テスト説明'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    test('Returns 400 for name too long', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      const { POST } = await import('@/app/api/genres/route')
      const request = new Request('http://localhost/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'a'.repeat(51)
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    test('Returns 409 for duplicate name', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      mockPrisma.genre.findFirst.mockResolvedValue({
        id: 'existing',
        name: 'テストジャンル'
      })

      const { POST } = await import('@/app/api/genres/route')
      const request = new Request('http://localhost/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'テストジャンル'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(409)
    })
  })

  describe('PUT /api/genres/[id]', () => {
    test('Updates genre successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      mockPrisma.genre.findFirst.mockResolvedValueOnce({
        id: 'genre1',
        name: '元のジャンル',
        userId: 'user1'
      })
      
      mockPrisma.genre.findFirst.mockResolvedValueOnce(null) // 重複なし

      mockPrisma.genre.update.mockResolvedValue({
        id: 'genre1',
        name: '更新されたジャンル',
        description: '更新された説明',
        color: '#EF4444',
        updatedAt: new Date('2023-12-01')
      })

      const { PUT } = await import('@/app/api/genres/[id]/route')
      const request = new Request('http://localhost/api/genres/genre1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '更新されたジャンル',
          description: '更新された説明',
          color: '#EF4444'
        })
      })

      const response = await PUT(request, { params: { id: 'genre1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('ジャンルが正常に更新されました')
    })

    test('Returns 404 for non-existent genre', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      mockPrisma.genre.findFirst.mockResolvedValue(null)

      const { PUT } = await import('@/app/api/genres/[id]/route')
      const request = new Request('http://localhost/api/genres/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '更新されたジャンル'
        })
      })

      const response = await PUT(request, { params: { id: 'nonexistent' } })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/genres/[id]', () => {
    test('Deletes genre successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      mockPrisma.genre.findFirst.mockResolvedValue({
        id: 'genre1',
        name: 'テストジャンル',
        userId: 'user1',
        articleGenres: []
      })

      mockPrisma.genre.delete.mockResolvedValue({})

      const { DELETE } = await import('@/app/api/genres/[id]/route')
      const request = new Request('http://localhost/api/genres/genre1', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'genre1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('ジャンルが正常に削除されました')
    })

    test('Returns 400 when genre has related articles', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1' }
      })

      mockPrisma.genre.findFirst.mockResolvedValue({
        id: 'genre1',
        name: 'テストジャンル',
        userId: 'user1',
        articleGenres: [{ id: 'relation1' }]
      })

      const { DELETE } = await import('@/app/api/genres/[id]/route')
      const request = new Request('http://localhost/api/genres/genre1', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'genre1' } })

      expect(response.status).toBe(400)
    })
  })
})