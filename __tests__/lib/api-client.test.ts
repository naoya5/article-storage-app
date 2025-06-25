import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient, api, ApiError, getErrorMessage } from '@/lib/api-client'

// Mock fetch globally
global.fetch = vi.fn()

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should make successful GET request', async () => {
    const mockData = { message: 'success', data: { id: 1 } }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData
    } as Response)

    const result = await apiClient('/api/test')

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    expect(result).toEqual(mockData)
  })

  it('should make successful POST request with body', async () => {
    const requestBody = { name: 'test' }
    const mockResponse = { message: 'created', id: 1 }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse
    } as Response)

    const result = await apiClient('/api/test', {
      method: 'POST',
      body: requestBody
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
    )
    expect(result).toEqual(mockResponse)
  })

  it('should throw ApiError for HTTP errors', async () => {
    const errorResponse = { error: 'Not found' }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => errorResponse
    } as Response)

    await expect(apiClient('/api/test')).rejects.toThrow(ApiError)
    await expect(apiClient('/api/test')).rejects.toThrow('Not found')
  })

  it('should throw ApiError for network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('fetch failed'))

    await expect(apiClient('/api/test')).rejects.toThrow(ApiError)
    await expect(apiClient('/api/test')).rejects.toThrow('ネットワークエラーが発生しました')
  })

  it('should handle AbortError', async () => {
    const abortError = new DOMException('Operation was aborted', 'AbortError')
    vi.mocked(fetch).mockRejectedValueOnce(abortError)

    await expect(apiClient('/api/test')).rejects.toThrow(ApiError)
    await expect(apiClient('/api/test')).rejects.toThrow('リクエストがキャンセルされました')
  })

  it('should include AbortSignal when provided', async () => {
    const controller = new AbortController()
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true })
    } as Response)

    await apiClient('/api/test', { signal: controller.signal })

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })
})

describe('api convenience methods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call GET method correctly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: 'test' })
    } as Response)

    await api.get('/api/test')

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('should call POST method correctly', async () => {
    const body = { name: 'test' }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 1 })
    } as Response)

    await api.post('/api/test', body)

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body)
      })
    )
  })

  it('should call PATCH method correctly', async () => {
    const body = { status: 'updated' }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true })
    } as Response)

    await api.patch('/api/test/1', body)

    expect(fetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(body)
      })
    )
  })

  it('should call DELETE method correctly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    } as Response)

    await api.delete('/api/test/1')

    expect(fetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

describe('getErrorMessage', () => {
  it('should return ApiError message', () => {
    const error = new ApiError('Test error', 400, 'Bad Request')
    expect(getErrorMessage(error)).toBe('Test error')
  })

  it('should return Error message', () => {
    const error = new Error('Generic error')
    expect(getErrorMessage(error)).toBe('Generic error')
  })

  it('should return default message for unknown errors', () => {
    expect(getErrorMessage('string error')).toBe('予期しないエラーが発生しました')
    expect(getErrorMessage(null)).toBe('予期しないエラーが発生しました')
    expect(getErrorMessage(undefined)).toBe('予期しないエラーが発生しました')
  })
})