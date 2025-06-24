import { Platform } from "@prisma/client"

export function detectPlatform(url: string): Platform | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Twitter (X.com)
    if (hostname === 'twitter.com' || 
        hostname === 'www.twitter.com' ||
        hostname === 'x.com' ||
        hostname === 'www.x.com') {
      return Platform.TWITTER
    }

    // Zenn
    if (hostname === 'zenn.dev' || hostname === 'www.zenn.dev') {
      return Platform.ZENN
    }

    // Qiita
    if (hostname === 'qiita.com' || hostname === 'www.qiita.com') {
      return Platform.QIITA
    }

    return null
  } catch (error) {
    console.error('Invalid URL:', error)
    return null
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isSupportedPlatform(url: string): boolean {
  return detectPlatform(url) !== null
}