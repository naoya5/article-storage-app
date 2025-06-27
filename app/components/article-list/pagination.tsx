interface PaginationInfo {
  currentPage: number
  totalPages: number
  limit: number
  total: number
}

interface PaginationProps {
  pagination: PaginationInfo
  currentPage: number
  onPageChange: (page: number) => void
}

export function Pagination({ pagination, currentPage, onPageChange }: PaginationProps) {
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <>
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          前へ
        </button>
        
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              page === currentPage
                ? "text-white bg-blue-600 hover:bg-blue-700"
                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          次へ
        </button>
      </div>

      <div className="text-center text-sm text-gray-600 mt-4">
        {pagination.total}件中 {(currentPage - 1) * pagination.limit + 1}〜
        {Math.min(currentPage * pagination.limit, pagination.total)}件を表示
      </div>
    </>
  )
}