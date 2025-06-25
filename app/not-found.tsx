export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '400px',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>404</h1>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem'
            }}>
              ページが見つかりません
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              お探しのページは存在しないか、移動された可能性があります。
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/dashboard"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                ダッシュボードに戻る
              </a>
            </div>
            
            <div>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                ホームページに戻る
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}