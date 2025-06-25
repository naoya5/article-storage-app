import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PATCH } from '@/app/api/bookmarks/[id]/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { ReadStatus } from '@prisma/client'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    bookmark: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {}
}))

describe('/api/bookmarks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('PATCH', () => {
    it('should update bookmark read status successfully', async () => {
      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      // Mock existing bookmark
      const existingBookmark = {
        id: 'bookmark1',
        userId: 'user1',
        articleId: 'article1',
        readStatus: ReadStatus.UNREAD,
        isFavorite: false,
        rating: null,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(existingBookmark)

      // Mock bookmark update
      const updatedBookmark = {
        ...existingBookmark,
        readStatus: ReadStatus.READ,
        updatedAt: new Date()
      }
      vi.mocked(prisma.bookmark.update).mockResolvedValue(updatedBookmark)

      const request = new Request('http://localhost:3000/api/bookmarks/bookmark1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readStatus: ReadStatus.READ })
      })

      const response = await PATCH(request, { params: { id: 'bookmark1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('ブックマークが更新されました')
      expect(data.bookmark.readStatus).toBe(ReadStatus.READ)
      expect(prisma.bookmark.update).toHaveBeenCalledWith({
        where: { id: 'bookmark1' },
        data: { readStatus: ReadStatus.READ }
      })
    })

    it('should update multiple bookmark fields', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      const existingBookmark = {
        id: 'bookmark1',
        userId: 'user1',
        articleId: 'article1',
        readStatus: ReadStatus.UNREAD,
        isFavorite: false,
        rating: null,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(existingBookmark)

      const updatedBookmark = {
        ...existingBookmark,
        readStatus: ReadStatus.READ,
        isFavorite: true,
        rating: 5,
        memo: 'Great article!',
        updatedAt: new Date()
      }
      vi.mocked(prisma.bookmark.update).mockResolvedValue(updatedBookmark)

      const request = new Request('http://localhost:3000/api/bookmarks/bookmark1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readStatus: ReadStatus.READ,
          isFavorite: true,
          rating: 5,
          memo: 'Great article!'
        })
      })

      const response = await PATCH(request, { params: { id: 'bookmark1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.bookmark.readStatus).toBe(ReadStatus.READ)
      expect(data.bookmark.isFavorite).toBe(true)
      expect(data.bookmark.rating).toBe(5)
      expect(data.bookmark.memo).toBe('Great article!')
    })

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/bookmarks/bookmark1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readStatus: ReadStatus.READ })
      })

      const response = await PATCH(request, { params: { id: 'bookmark1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('認証が必要です')
    })

    it('should return 404 when bookmark not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/bookmarks/bookmark1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readStatus: ReadStatus.READ })
      })

      const response = await PATCH(request, { params: { id: 'bookmark1' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('ブックマークが見つかりません')
    })

    it('should return 400 for invalid read status', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      const request = new Request('http://localhost:3000/api/bookmarks/bookmark1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readStatus: 'INVALID_STATUS' })
      })

      const response = await PATCH(request, { params: { id: 'bookmark1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('無効な読書ステータスです')
    })

    it('should return 400 for invalid rating', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      const request = new Request('http://localhost:3000/api/bookmarks/bookmark1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 6 })
      })

      const response = await PATCH(request, { params: { id: 'bookmark1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('評価は1-5の範囲で入力してください')
    })
  })
})