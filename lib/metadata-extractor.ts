import * as cheerio from 'cheerio'

export interface ArticleMetadata {
  title: string
  description?: string
  author?: string
  publishedAt?: Date
  thumbnail?: string
  content?: string
}

export async function extractMetadata(url: string): Promise<ArticleMetadata> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10秒タイムアウト
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // タイトル取得
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      'タイトルなし'

    // 説明取得
    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      undefined

    // 著者取得
    const author = 
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('[rel="author"]').text() ||
      undefined

    // サムネイル取得
    const thumbnail = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      undefined

    // 公開日取得
    let publishedAt: Date | undefined
    const publishedAtStr = 
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="publish_date"]').attr('content') ||
      $('time[datetime]').attr('datetime')

    if (publishedAtStr) {
      const parsedDate = new Date(publishedAtStr)
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate
      }
    }

    // コンテンツ取得（最初の数段落）
    const contentElements = $('p, article p').slice(0, 3)
    const content = contentElements.map((_, el) => $(el).text().trim()).get().join('\n\n')

    return {
      title: title.trim(),
      description: description?.trim(),
      author: author?.trim(),
      publishedAt,
      thumbnail,
      content: content || undefined
    }
  } catch (error) {
    console.error('Error extracting metadata:', error)
    throw new Error('メタデータの取得に失敗しました')
  }
}