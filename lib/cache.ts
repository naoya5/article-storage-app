// シンプルなメモリキャッシュ実装
class MemoryCache {
  private cache = new Map<string, { data: unknown; expires: number }>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5分

  set(key: string, data: unknown, ttl = this.defaultTTL): void {
    const expires = Date.now() + ttl
    this.cache.set(key, { data, expires })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // ユーザー関連のキャッシュをクリア
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.includes(userId)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // 期限切れアイテムを定期的にクリーンアップ
  cleanup(): void {
    const now = Date.now()
    this.cache.forEach((item, key) => {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    })
  }
}

export const cache = new MemoryCache()

// 5分おきにクリーンアップを実行
if (typeof window === 'undefined') { // サーバーサイドのみ
  setInterval(() => {
    cache.cleanup()
  }, 5 * 60 * 1000)
}

// キャッシュキーヘルパー関数
export const cacheKeys = {
  stats: (userId: string) => `stats:${userId}`,
  articles: (userId: string, params: string) => `articles:${userId}:${params}`,
  genres: (userId: string) => `genres:${userId}`,
  tags: (userId: string) => `tags:${userId}`,
} as const