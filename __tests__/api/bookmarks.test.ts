import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST, DELETE } from '@/app/api/bookmarks/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    bookmark: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn()
    }
  }
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {}
}))

describe('/api/bookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('POST', () => {
    it('should create a bookmark successfully', async () => {
      // Mock authenticated session
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      // Mock no existing bookmark
      vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(null)

      // Mock bookmark creation
      const mockBookmark = {
        id: 'bookmark1',
        userId: 'user1',
        articleId: 'article1',
        createdAt: new Date()
      }
      vi.mocked(prisma.bookmark.create).mockResolvedValue(mockBookmark)

      const request = new Request('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: 'article1' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('ブックマークに追加しました')
      expect(data.bookmark.id).toBe('bookmark1')
      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          articleId: 'article1'
        }
      })
    })

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: 'article1' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('認証が必要です')
    })

    it('should return 400 when articleId is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      const request = new Request('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('記事IDが必要です')
    })

    it('should return 409 when bookmark already exists', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      // Mock existing bookmark
      const existingBookmark = {
        id: 'bookmark1',
        userId: 'user1',
        articleId: 'article1',
        createdAt: new Date()
      }
      vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(existingBookmark)

      const request = new Request('http://localhost:3000/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: 'article1' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('既にブックマークされています')
    })
  })

  describe('DELETE', () => {
    it('should delete a bookmark successfully', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      // Mock existing bookmark
      const existingBookmark = {
        id: 'bookmark1',
        userId: 'user1',
        articleId: 'article1',
        createdAt: new Date()
      }
      vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(existingBookmark)
      vi.mocked(prisma.bookmark.delete).mockResolvedValue(existingBookmark)

      const request = new Request('http://localhost:3000/api/bookmarks?articleId=article1', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('ブックマークを削除しました')
      expect(prisma.bookmark.delete).toHaveBeenCalledWith({
        where: { id: 'bookmark1' }
      })
    })

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/bookmarks?articleId=article1', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('認証が必要です')
    })

    it('should return 400 when articleId is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      const request = new Request('http://localhost:3000/api/bookmarks', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('記事IDが必要です')
    })

    it('should return 404 when bookmark not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1' }
      })

      // Mock no existing bookmark
      vi.mocked(prisma.bookmark.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/bookmarks?articleId=article1', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('ブックマークが見つかりません')
    })
  })
})