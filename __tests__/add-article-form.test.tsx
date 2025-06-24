/**
 * 記事追加フォームのテスト
 */

import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AddArticleForm } from '@/app/components/add-article-form'

// next-auth/react をモック
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

describe('AddArticleForm Tests', () => {
  test('Shows login required message when not authenticated', async () => {
    const { useSession } = await import('next-auth/react')
    
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })

    render(<AddArticleForm />)
    
    expect(screen.getByText('記事を追加するにはログインが必要です。')).toBeDefined()
  })

  test('Shows form when authenticated', async () => {
    const { useSession } = await import('next-auth/react')
    
    const mockSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      },
      expires: '2025-12-31'
    }

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    })

    const { container } = render(<AddArticleForm />)
    
    // フォームが存在することを確認
    expect(container.querySelector('form')).toBeDefined()
    expect(screen.getByLabelText('記事URL')).toBeDefined()
    expect(screen.getByPlaceholderText('https://zenn.dev/username/articles/article-title')).toBeDefined()
    expect(screen.getByText('Twitter、Zenn、QiitaのURLを入力してください')).toBeDefined()
  })

  test('Component can be rendered with callback prop', async () => {
    const { useSession } = await import('next-auth/react')
    
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })

    const mockCallback = vi.fn()
    
    expect(() => {
      render(<AddArticleForm onArticleAdded={mockCallback} />)
    }).not.toThrow()
  })
});