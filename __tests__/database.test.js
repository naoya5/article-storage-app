/**
 * データベーススキーマテスト
 */

import { describe, test, expect } from 'vitest'

describe('Database Schema Tests', () => {
  test('Prisma schema can be imported', async () => {
    // Prismaクライアントがインポート可能かテスト
    const { PrismaClient } = await import('@prisma/client')
    expect(PrismaClient).toBeDefined()
    expect(typeof PrismaClient).toBe('function')
  })

  test('Platform enum values are correct', async () => {
    const { Platform } = await import('@prisma/client')
    expect(Platform.TWITTER).toBe('TWITTER')
    expect(Platform.ZENN).toBe('ZENN')
    expect(Platform.QIITA).toBe('QIITA')
  })

  test('ReadStatus enum values are correct', async () => {
    const { ReadStatus } = await import('@prisma/client')
    expect(ReadStatus.UNREAD).toBe('UNREAD')
    expect(ReadStatus.READ).toBe('READ')
    expect(ReadStatus.READ_LATER).toBe('READ_LATER')
  })

  test('Prisma schema file exists and has required models', async () => {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
    const schemaContent = await fs.readFile(schemaPath, 'utf-8')
    
    // 主要なモデルが定義されているかチェック
    expect(schemaContent).toMatch(/model User/)
    expect(schemaContent).toMatch(/model Article/)
    expect(schemaContent).toMatch(/model Genre/)
    expect(schemaContent).toMatch(/model Tag/)
    expect(schemaContent).toMatch(/model Bookmark/)
    expect(schemaContent).toMatch(/model Account/)
    expect(schemaContent).toMatch(/model Session/)
    
    // Enumが定義されているかチェック
    expect(schemaContent).toMatch(/enum Platform/)
    expect(schemaContent).toMatch(/enum ReadStatus/)
  })
});