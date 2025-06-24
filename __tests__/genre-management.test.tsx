/**
 * ジャンル管理機能のテスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GenreManager } from '@/app/components/genre-manager'
import { GenreForm } from '@/app/components/genre-form'
import { ArticleGenreSelector } from '@/app/components/article-genre-selector'

// fetch をモック
global.fetch = vi.fn()
global.alert = vi.fn()
global.confirm = vi.fn()

describe('GenreManager Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  test('Shows loading state initially', () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ genres: [] })
    } as Response)

    render(<GenreManager />)
    
    const loadingSpinner = document.querySelector('.animate-spin')
    expect(loadingSpinner).toBeDefined()
  })

  test('Shows empty state when no genres', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ genres: [] })
    } as Response)

    render(<GenreManager />)
    
    await waitFor(() => {
      expect(screen.getByText('まだジャンルが作成されていません')).toBeDefined()
    })
  })

  test('Shows error state on fetch failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500
    } as Response)

    render(<GenreManager />)
    
    await waitFor(() => {
      expect(screen.getByText('ジャンルの取得に失敗しました')).toBeDefined()
    })
  })

  test('Renders genres correctly', async () => {
    const mockGenres = [
      {
        id: '1',
        name: 'プログラミング',
        description: 'プログラミング関連の記事',
        color: '#3B82F6',
        articleCount: 5,
        createdAt: '2023-12-01T00:00:00Z'
      }
    ]

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ genres: mockGenres })
    } as Response)

    render(<GenreManager />)
    
    await waitFor(() => {
      expect(screen.getByText('プログラミング')).toBeDefined()
      expect(screen.getByText('プログラミング関連の記事')).toBeDefined()
      expect(screen.getByText('5件の記事')).toBeDefined()
    })
  })

  test('Shows create button', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ genres: [] })
    } as Response)

    render(<GenreManager />)
    
    await waitFor(() => {
      expect(screen.getByText('ジャンル作成')).toBeDefined()
    })
  })
})

describe('GenreForm Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  test('Renders create form correctly', () => {
    render(
      <GenreForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getByText('ジャンル作成')).toBeDefined()
    expect(screen.getByLabelText('ジャンル名 *')).toBeDefined()
    expect(screen.getByLabelText('説明（任意）')).toBeDefined()
    expect(screen.getByText('カラー')).toBeDefined()
  })

  test('Renders edit form correctly', () => {
    const mockGenre = {
      id: '1',
      name: 'テストジャンル',
      description: 'テスト説明',
      color: '#3B82F6'
    }

    render(
      <GenreForm 
        genre={mockGenre}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getByText('ジャンル編集')).toBeDefined()
    expect(screen.getByDisplayValue('テストジャンル')).toBeDefined()
    expect(screen.getByDisplayValue('テスト説明')).toBeDefined()
  })

  test('Submit button is disabled when name is empty', () => {
    render(
      <GenreForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    
    const submitButton = screen.getByText('作成')
    expect(submitButton.hasAttribute('disabled')).toBe(true)
  })

  test('Character count updates correctly', () => {
    render(
      <GenreForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    
    const nameInput = screen.getByLabelText('ジャンル名 *')
    fireEvent.change(nameInput, { target: { value: 'テスト' } })
    
    expect(screen.getByText('3/50文字')).toBeDefined()
  })

  test('Calls onCancel when cancel button clicked', () => {
    render(
      <GenreForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    
    const cancelButton = screen.getByText('キャンセル')
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  test('Color selection works', () => {
    const { container } = render(
      <GenreForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )
    
    // カラーオプションのボタンを取得（2番目の色を選択）
    const colorButtons = container.querySelectorAll('button[style*="background-color"]')
    expect(colorButtons.length).toBeGreaterThan(1)
    
    fireEvent.click(colorButtons[1])
    
    // 選択されたことを確認
    expect(colorButtons[1].className).toContain('border-gray-800')
  })
})

describe('ArticleGenreSelector Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  const mockOnGenresChange = vi.fn()
  const mockCurrentGenres = [
    {
      id: '1',
      genreId: 'genre1',
      genre: {
        id: 'genre1',
        name: 'プログラミング',
        color: '#3B82F6'
      }
    }
  ]

  test('Renders current genres', () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ genres: [] })
    } as Response)

    render(
      <ArticleGenreSelector
        articleId="article1"
        currentGenres={mockCurrentGenres}
        onGenresChange={mockOnGenresChange}
      />
    )
    
    expect(screen.getByText('プログラミング')).toBeDefined()
  })

  test('Shows add genre button when available genres exist', async () => {
    const mockGenres = [
      {
        id: 'genre2',
        name: 'デザイン',
        color: '#EF4444',
        articleCount: 0
      }
    ]

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ genres: mockGenres })
    } as Response)

    render(
      <ArticleGenreSelector
        articleId="article1"
        currentGenres={mockCurrentGenres}
        onGenresChange={mockOnGenresChange}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('+ ジャンル追加')).toBeDefined()
    })
  })

  test('Remove genre button works', () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ genres: [] })
    } as Response)

    render(
      <ArticleGenreSelector
        articleId="article1"
        currentGenres={mockCurrentGenres}
        onGenresChange={mockOnGenresChange}
      />
    )
    
    const removeButton = screen.getByText('×')
    expect(removeButton).toBeDefined()
    
    fireEvent.click(removeButton)
    
    expect(fetch).toHaveBeenCalledWith(
      '/api/articles/article1/genres',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genreId: 'genre1' }),
      })
    )
  })
})