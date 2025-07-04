import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DarkModeToggle } from "@/app/components/dark-mode-toggle"
import Link from "next/link"
import { AddArticleWithPreview } from "./components/add-article-with-preview"

export const dynamic = "force-dynamic"

export default async function AddArticlePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-background/90 dark:bg-gray-900/90 backdrop-blur-sm border-border dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                ← ホーム
              </Link>
              <div className="h-6 w-px bg-border dark:bg-gray-600"></div>
              <Link 
                href="/articles" 
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                記事一覧
              </Link>
              <div className="h-6 w-px bg-border dark:bg-gray-600"></div>
              <Link 
                href="/dashboard" 
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                ダッシュボード
              </Link>
              <h1 className="text-2xl font-bold text-foreground">記事追加</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {session.user?.name || session.user?.email}さん
              </div>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            新しい記事を追加
          </h2>
          <p className="text-muted-foreground">
            Twitter(X)、Zenn、QiitaのURLを入力して記事を追加できます。下部にリアルタイムプレビューが表示されます。
          </p>
        </div>

        <AddArticleWithPreview />
      </main>
    </div>
  )
}