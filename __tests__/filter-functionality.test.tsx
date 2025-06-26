import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { SearchBar } from '@/app/components/search-bar'
import type { SearchFilters, Genre, Tag } from '@/types/api'

describe('Filter Functionality Tests', () => {
  const mockOnSearch = vi.fn()
  const mockGenres: Genre[] = [
    { id: '1', name: 'React', color: '#61DAFB', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'TypeScript', color: '#3178C6', createdAt: new Date(), updatedAt: new Date() }
  ]
  const mockTags: Tag[] = [
    { id: '1', name: 'frontend', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'backend', createdAt: new Date(), updatedAt: new Date() }
  ]

  beforeEach(() => {
    mockOnSearch.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders basic search input', () => {
    const { container } = render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    expect(screen.getByPlaceholderText('記事のタイトルや内容で検索...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /フィルター/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument()
  })

  it('shows filter options when filter button is clicked', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    const filterButton = screen.getAllByText('フィルター')[0]
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      expect(screen.getByText('プラットフォーム')).toBeInTheDocument()
      expect(screen.getByText('ジャンル')).toBeInTheDocument()
      expect(screen.getByText('タグ')).toBeInTheDocument()
      expect(screen.getByText('投稿日期間')).toBeInTheDocument()
    })
  })

  it('shows platform filter options', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      const platformSelect = screen.getByDisplayValue('すべて')
      expect(platformSelect).toBeInTheDocument()
    })
    
    // プラットフォーム選択肢をチェック
    const platformSelect = screen.getAllByDisplayValue('すべて')[0] // プラットフォームのselect
    fireEvent.click(platformSelect)
    
    expect(screen.getByText('Twitter')).toBeInTheDocument()
    expect(screen.getByText('Zenn')).toBeInTheDocument()
    expect(screen.getByText('Qiita')).toBeInTheDocument()
  })

  it('shows genre filter options from props', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  it('shows tag filter options from props', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      expect(screen.getByText('#frontend')).toBeInTheDocument()
      expect(screen.getByText('#backend')).toBeInTheDocument()
    })
  })

  it('shows date range filter inputs', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      expect(screen.getByText('開始日')).toBeInTheDocument()
      expect(screen.getByText('終了日')).toBeInTheDocument()
    })
    
    // date inputsが存在することを確認
    const dateInputs = screen.getAllByDisplayValue('')
    const dateInputsFiltered = dateInputs.filter(input => 
      input.getAttribute('type') === 'date'
    )
    expect(dateInputsFiltered).toHaveLength(2)
  })

  it('calls onSearch with correct filters when search button is clicked', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    // 検索キーワードを入力
    const searchInput = screen.getByPlaceholderText('記事のタイトルや内容で検索...')
    fireEvent.change(searchInput, { target: { value: 'React hooks' } })
    
    // フィルターを開く
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      // プラットフォームを選択
      const platformSelects = screen.getAllByDisplayValue('すべて')
      const platformSelect = platformSelects[0] // プラットフォームのselect
      fireEvent.change(platformSelect, { target: { value: 'TWITTER' } })
      
      // ジャンルを選択
      const genreSelect = platformSelects[1] // ジャンルのselect
      fireEvent.change(genreSelect, { target: { value: '1' } })
    })
    
    // 検索ボタンをクリック
    const searchButton = screen.getByText('検索')
    fireEvent.click(searchButton)
    
    expect(mockOnSearch).toHaveBeenCalledWith({
      query: 'React hooks',
      platform: 'TWITTER',
      genreId: '1',
      tagId: '',
      dateFrom: '',
      dateTo: ''
    })
  })

  it('shows filter count when filters are applied', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    // フィルターを開く
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      // プラットフォームを選択
      const platformSelects = screen.getAllByDisplayValue('すべて')
      const platformSelect = platformSelects[0]
      fireEvent.change(platformSelect, { target: { value: 'TWITTER' } })
    })
    
    // フィルター数がボタンに表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('フィルター (1)')).toBeInTheDocument()
    })
  })

  it('resets all filters when reset button is clicked', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    // 検索キーワードを入力
    const searchInput = screen.getByPlaceholderText('記事のタイトルや内容で検索...')
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    
    // フィルターを開いて設定
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    await waitFor(() => {
      const platformSelects = screen.getAllByDisplayValue('すべて')
      const platformSelect = platformSelects[0]
      fireEvent.change(platformSelect, { target: { value: 'TWITTER' } })
    })
    
    // リセットボタンをクリック
    await waitFor(() => {
      const resetButton = screen.getByText('検索条件をクリア')
      fireEvent.click(resetButton)
    })
    
    // リセット後のonSearchが呼ばれることを確認
    expect(mockOnSearch).toHaveBeenCalledWith({
      query: '',
      platform: '',
      genreId: '',
      tagId: '',
      dateFrom: '',
      dateTo: ''
    })
  })

  it('handles loading state correctly', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        loading={true}
        availableGenres={mockGenres}
        availableTags={mockTags}
      />
    )
    
    // ローディング中は入力が無効化される
    const searchInput = screen.getByPlaceholderText('記事のタイトルや内容で検索...')
    expect(searchInput).toBeDisabled()
    
    // 検索ボタンのテキストが変わる
    expect(screen.getByText('検索中...')).toBeInTheDocument()
    const searchButton = screen.getByText('検索中...')
    expect(searchButton).toBeDisabled()
  })

  it('handles empty genres and tags arrays', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        availableGenres={[]}
        availableTags={[]}
      />
    )
    
    // フィルターを開く
    const filterButton = screen.getByText('フィルター')
    fireEvent.click(filterButton)
    
    // ジャンルとタグのセレクトボックスには「すべて」オプションのみが表示される
    expect(screen.getByText('プラットフォーム')).toBeInTheDocument()
    expect(screen.getByText('ジャンル')).toBeInTheDocument()
    expect(screen.getByText('タグ')).toBeInTheDocument()
  })
})