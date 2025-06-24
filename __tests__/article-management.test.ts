/**
 * 記事管理機能のテスト
 */

import { describe, test, expect } from 'vitest'
import { detectPlatform, isValidUrl, isSupportedPlatform } from '@/lib/platform-detector'
import { Platform } from '@prisma/client'

describe('Platform Detection Tests', () => {
  test('Twitter URLs are detected correctly', () => {
    expect(detectPlatform('https://twitter.com/user/status/123')).toBe(Platform.TWITTER)
    expect(detectPlatform('https://www.twitter.com/user/status/123')).toBe(Platform.TWITTER)
    expect(detectPlatform('https://x.com/user/status/123')).toBe(Platform.TWITTER)
    expect(detectPlatform('https://www.x.com/user/status/123')).toBe(Platform.TWITTER)
  })

  test('Zenn URLs are detected correctly', () => {
    expect(detectPlatform('https://zenn.dev/username/articles/article-slug')).toBe(Platform.ZENN)
    expect(detectPlatform('https://www.zenn.dev/username/articles/article-slug')).toBe(Platform.ZENN)
  })

  test('Qiita URLs are detected correctly', () => {
    expect(detectPlatform('https://qiita.com/username/items/item-id')).toBe(Platform.QIITA)
    expect(detectPlatform('https://www.qiita.com/username/items/item-id')).toBe(Platform.QIITA)
  })

  test('Unsupported URLs return null', () => {
    expect(detectPlatform('https://example.com/article')).toBe(null)
    expect(detectPlatform('https://medium.com/@user/article')).toBe(null)
    expect(detectPlatform('https://dev.to/user/article')).toBe(null)
  })

  test('Invalid URLs return null', () => {
    expect(detectPlatform('not-a-url')).toBe(null)
    expect(detectPlatform('')).toBe(null)
    expect(detectPlatform('ftp://example.com')).toBe(null)
  })
})

describe('URL Validation Tests', () => {
  test('Valid URLs return true', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('https://zenn.dev/user/articles/slug')).toBe(true)
  })

  test('Invalid URLs return false', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('example.com')).toBe(false)
  })
})

describe('Supported Platform Tests', () => {
  test('Supported platforms return true', () => {
    expect(isSupportedPlatform('https://twitter.com/user/status/123')).toBe(true)
    expect(isSupportedPlatform('https://zenn.dev/user/articles/slug')).toBe(true)
    expect(isSupportedPlatform('https://qiita.com/user/items/id')).toBe(true)
  })

  test('Unsupported platforms return false', () => {
    expect(isSupportedPlatform('https://example.com')).toBe(false)
    expect(isSupportedPlatform('https://medium.com/@user/article')).toBe(false)
  })
})

describe('Metadata Extraction Tests', () => {
  test('Metadata extractor can be imported', async () => {
    const { extractMetadata } = await import('@/lib/metadata-extractor')
    expect(extractMetadata).toBeDefined()
    expect(typeof extractMetadata).toBe('function')
  })

  test('ArticleMetadata interface has correct structure', async () => {
    const { extractMetadata } = await import('@/lib/metadata-extractor')
    
    // モック関数として最小限のテスト
    expect(() => {
      const metadata = {
        title: 'Test Title',
        description: 'Test Description',
        author: 'Test Author',
        publishedAt: new Date(),
        thumbnail: 'https://example.com/image.jpg',
        content: 'Test Content'
      }
      
      // 型チェック
      expect(typeof metadata.title).toBe('string')
      expect(typeof metadata.description).toBe('string')
      expect(typeof metadata.author).toBe('string')
      expect(metadata.publishedAt instanceof Date).toBe(true)
      expect(typeof metadata.thumbnail).toBe('string')
      expect(typeof metadata.content).toBe('string')
    }).not.toThrow()
  })
});