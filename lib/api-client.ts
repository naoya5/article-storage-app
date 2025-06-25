/**
 * API Client utility for Next.js App Router
 * Provides type-safe fetch wrapper with proper error handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * Type-safe API client for internal API routes
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options

  // Build absolute URL for internal API calls in browser environment
  const url = endpoint.startsWith('/') && typeof window !== 'undefined'
    ? `${window.location.origin}${endpoint}`
    : endpoint

  const config: RequestInit = {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, config)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(
          `HTTP Error: ${response.status}`,
          response.status,
          response.statusText
        )
      }
      return response as unknown as T
    }

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP Error: ${response.status}`,
        response.status,
        response.statusText
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('ネットワークエラーが発生しました', 0, 'Network Error')
    }

    // Handle AbortError
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('リクエストがキャンセルされました', 0, 'Aborted')
    }

    throw new ApiError(
      error instanceof Error ? error.message : '不明なエラーが発生しました',
      0,
      'Unknown Error'
    )
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: <T = unknown>(endpoint: string, signal?: AbortSignal) =>
    apiClient<T>(endpoint, { method: 'GET', signal }),

  post: <T = unknown>(endpoint: string, body?: unknown, signal?: AbortSignal) =>
    apiClient<T>(endpoint, { method: 'POST', body, signal }),

  put: <T = unknown>(endpoint: string, body?: unknown, signal?: AbortSignal) =>
    apiClient<T>(endpoint, { method: 'PUT', body, signal }),

  patch: <T = unknown>(endpoint: string, body?: unknown, signal?: AbortSignal) =>
    apiClient<T>(endpoint, { method: 'PATCH', body, signal }),

  delete: <T = unknown>(endpoint: string, signal?: AbortSignal) =>
    apiClient<T>(endpoint, { method: 'DELETE', signal }),
}

/**
 * Hook for handling API errors with user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '予期しないエラーが発生しました'
}