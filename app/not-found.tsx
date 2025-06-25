import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <p className="text-xl md:text-2xl font-light leading-normal">
          ページが見つかりません
        </p>
        <p className="mb-8">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <div className="space-y-4">
          <Link 
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ダッシュボードに戻る
          </Link>
          <br />
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ホームページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}