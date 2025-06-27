interface ErrorDisplayProps {
  error: string
  onRetry: () => void
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-4">{error}</div>
      <button
        onClick={onRetry}
        className="text-blue-600 hover:text-blue-800"
      >
        再試行
      </button>
    </div>
  )
}