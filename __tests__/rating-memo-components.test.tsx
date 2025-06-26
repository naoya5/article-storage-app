import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { RatingSelector } from '@/app/components/rating-selector'
import { MemoEditor } from '@/app/components/memo-editor'
import * as apiClient from '@/lib/api-client'

// API clientをモック
vi.mock('@/lib/api-client', () => ({
  api: {
    patch: vi.fn(),
  },
  getErrorMessage: vi.fn((error) => error?.message || 'エラーが発生しました'),
}))

const mockApi = vi.mocked(apiClient.api)

describe('Rating and Memo Components Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    cleanup()
  })

  describe('RatingSelector', () => {
    const defaultProps = {
      bookmarkId: 'bookmark-1',
      currentRating: null,
      onRatingChange: vi.fn(),
    }

    it('renders five star buttons', () => {
      const { container } = render(<RatingSelector {...defaultProps} />)
      
      // 5つの星ボタンが表示される
      const starButtons = container.querySelectorAll('button[title*="つ星で評価"]')
      expect(starButtons).toHaveLength(5)
    })

    it('shows current rating correctly', () => {
      render(<RatingSelector {...defaultProps} currentRating={3} />)
      
      // 現在の評価が正しく表示される（3つ星が埋まっている状態）
      const starButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('title')?.includes('つ星で評価')
      )
      
      expect(starButtons).toHaveLength(5)
    })

    it('shows clear button when rating exists', () => {
      render(<RatingSelector {...defaultProps} currentRating={4} />)
      
      expect(screen.getByText('クリア')).toBeInTheDocument()
    })

    it('does not show clear button when no rating', () => {
      render(<RatingSelector {...defaultProps} currentRating={null} />)
      
      expect(screen.queryByText('クリア')).not.toBeInTheDocument()
    })

    it('calls API when rating is selected', async () => {
      mockApi.patch.mockResolvedValue({})
      const onRatingChange = vi.fn()
      
      render(
        <RatingSelector 
          {...defaultProps} 
          onRatingChange={onRatingChange}
        />
      )
      
      // 3つ星をクリック
      const thirdStar = screen.getByTitle('3つ星で評価')
      fireEvent.click(thirdStar)
      
      await waitFor(() => {
        expect(mockApi.patch).toHaveBeenCalledWith('/api/bookmarks/bookmark-1', {
          rating: 3
        })
        expect(onRatingChange).toHaveBeenCalledWith(3)
      })
    })

    it('clears rating when clear button is clicked', async () => {
      mockApi.patch.mockResolvedValue({})
      const onRatingChange = vi.fn()
      
      render(
        <RatingSelector 
          {...defaultProps} 
          currentRating={4}
          onRatingChange={onRatingChange}
        />
      )
      
      // クリアボタンをクリック
      const clearButton = screen.getByText('クリア')
      fireEvent.click(clearButton)
      
      await waitFor(() => {
        expect(mockApi.patch).toHaveBeenCalledWith('/api/bookmarks/bookmark-1', {
          rating: null
        })
        expect(onRatingChange).toHaveBeenCalledWith(null)
      })
    })

    it('disables interaction when no bookmarkId', () => {
      render(<RatingSelector {...defaultProps} bookmarkId={undefined} />)
      
      const starButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('title')?.includes('つ星で評価')
      )
      
      starButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('MemoEditor', () => {
    const defaultProps = {
      bookmarkId: 'bookmark-1',
      currentMemo: null,
      onMemoChange: vi.fn(),
    }

    it('shows add memo button when no memo exists', () => {
      render(<MemoEditor {...defaultProps} />)
      
      expect(screen.getByText('+ メモを追加')).toBeInTheDocument()
    })

    it('shows memo content when memo exists', () => {
      render(
        <MemoEditor 
          {...defaultProps} 
          currentMemo="これは素晴らしい記事です"
        />
      )
      
      expect(screen.getByText('これは素晴らしい記事です')).toBeInTheDocument()
      expect(screen.getByText('編集')).toBeInTheDocument()
      expect(screen.getByText('削除')).toBeInTheDocument()
    })

    it('enters edit mode when add memo button is clicked', () => {
      render(<MemoEditor {...defaultProps} />)
      
      const addButton = screen.getByText('+ メモを追加')
      fireEvent.click(addButton)
      
      expect(screen.getByPlaceholderText('記事についてのメモを入力...')).toBeInTheDocument()
      expect(screen.getByText('保存')).toBeInTheDocument()
      expect(screen.getByText('キャンセル')).toBeInTheDocument()
    })

    it('enters edit mode when edit button is clicked', () => {
      render(
        <MemoEditor 
          {...defaultProps} 
          currentMemo="既存のメモ"
        />
      )
      
      const editButton = screen.getByText('編集')
      fireEvent.click(editButton)
      
      const textarea = screen.getByDisplayValue('既存のメモ')
      expect(textarea).toBeInTheDocument()
    })

    it('saves memo when save button is clicked', async () => {
      mockApi.patch.mockResolvedValue({})
      const onMemoChange = vi.fn()
      
      render(
        <MemoEditor 
          {...defaultProps} 
          onMemoChange={onMemoChange}
        />
      )
      
      // メモ追加モードに入る
      const addButton = screen.getByText('+ メモを追加')
      fireEvent.click(addButton)
      
      // テキストを入力
      const textarea = screen.getByPlaceholderText('記事についてのメモを入力...')
      fireEvent.change(textarea, { target: { value: '新しいメモ' } })
      
      // 保存ボタンをクリック
      const saveButton = screen.getByText('保存')
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockApi.patch).toHaveBeenCalledWith('/api/bookmarks/bookmark-1', {
          memo: '新しいメモ'
        })
        expect(onMemoChange).toHaveBeenCalledWith('新しいメモ')
      })
    })

    it('cancels edit when cancel button is clicked', () => {
      render(
        <MemoEditor 
          {...defaultProps} 
          currentMemo="既存のメモ"
        />
      )
      
      // 編集モードに入る
      const editButton = screen.getByText('編集')
      fireEvent.click(editButton)
      
      // テキストを変更
      const textarea = screen.getByDisplayValue('既存のメモ')
      fireEvent.change(textarea, { target: { value: '変更されたメモ' } })
      
      // キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル')
      fireEvent.click(cancelButton)
      
      // 元のメモが表示されることを確認
      expect(screen.getByText('既存のメモ')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('変更されたメモ')).not.toBeInTheDocument()
    })

    it('shows character count', () => {
      render(<MemoEditor {...defaultProps} />)
      
      // メモ追加モードに入る
      const addButton = screen.getByText('+ メモを追加')
      fireEvent.click(addButton)
      
      // 文字数カウントが表示される
      expect(screen.getByText('0/1000文字')).toBeInTheDocument()
      
      // テキストを入力
      const textarea = screen.getByPlaceholderText('記事についてのメモを入力...')
      fireEvent.change(textarea, { target: { value: 'テスト' } })
      
      expect(screen.getByText('3/1000文字')).toBeInTheDocument()
    })

    it('deletes memo when delete button is clicked', async () => {
      mockApi.patch.mockResolvedValue({})
      const onMemoChange = vi.fn()
      
      // window.confirmをモック
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      render(
        <MemoEditor 
          {...defaultProps} 
          currentMemo="削除されるメモ"
          onMemoChange={onMemoChange}
        />
      )
      
      const deleteButton = screen.getByText('削除')
      fireEvent.click(deleteButton)
      
      await waitFor(() => {
        expect(mockApi.patch).toHaveBeenCalledWith('/api/bookmarks/bookmark-1', {
          memo: null
        })
        expect(onMemoChange).toHaveBeenCalledWith(null)
      })
      
      confirmSpy.mockRestore()
    })

    it('disables interaction when no bookmarkId', () => {
      render(<MemoEditor {...defaultProps} bookmarkId={undefined} />)
      
      const addButton = screen.getByText('+ メモを追加')
      expect(addButton).toBeDisabled()
    })
  })
})