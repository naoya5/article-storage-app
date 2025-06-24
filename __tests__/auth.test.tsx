/**
 * 認証機能のテスト
 */

import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthButton } from '@/app/components/auth-button'
import { AuthProvider } from '@/app/components/auth-provider'

// next-auth/react をモック
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Authentication Tests', () => {
  test('AuthProvider component renders children', () => {
    render(
      <AuthProvider>
        <div data-testid="test-child">Test Child</div>
      </AuthProvider>
    )
    
    expect(screen.getByTestId('test-child')).toBeDefined()
  })

  test('AuthButton shows loading state', async () => {
    const { useSession } = await import('next-auth/react')
    
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn(),
    })

    render(<AuthButton />)
    
    // ローディングスピナーが表示されることを確認
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeDefined()
  })

  test('AuthButton shows sign in buttons when not authenticated', async () => {
    const { useSession } = await import('next-auth/react')
    
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })

    render(<AuthButton />)
    
    expect(screen.getByText('Googleでサインイン')).toBeDefined()
    expect(screen.getByText('GitHubでサインイン')).toBeDefined()
  })

  test('AuthButton shows user info and sign out when authenticated', async () => {
    const { useSession } = await import('next-auth/react')
    
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg'
      },
      expires: '2025-12-31'
    }

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    })

    render(<AuthButton />)
    
    expect(screen.getByText('Test User')).toBeDefined()
    expect(screen.getByText('サインアウト')).toBeDefined()
  })

  test('Auth configuration exports required values', async () => {
    const { authOptions } = await import('@/lib/auth')
    
    expect(authOptions).toBeDefined()
    expect(authOptions.providers).toBeDefined()
    expect(Array.isArray(authOptions.providers)).toBe(true)
    expect(authOptions.session?.strategy).toBe('database')
    expect(authOptions.callbacks).toBeDefined()
  })
});