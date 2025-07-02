import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ArticleList } from "@/app/components/article-list"
import { DarkModeToggle } from "@/app/components/dark-mode-toggle"
import Link from "next/link"
import type { Genre, Tag } from "@/types/api"

export const dynamic = "force-dynamic"

// Server Componentでジャンルとタグを取得
async function getFiltersData(userId: string) {
  const [genres, tags] = await Promise.all([
    prisma.genre.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return {
    genres: genres.map(genre => ({
      id: genre.id,
      name: genre.name,
      color: genre.color
    })) as Genre[],
    tags: tags.map(tag => ({
      id: tag.id,
      name: tag.name
    })) as Tag[]
  }
}

export default async function ArticlesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/")
  }

  const { genres, tags } = await getFiltersData(session.user.id)

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
                href="/dashboard" 
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                ダッシュボード
              </Link>
              <h1 className="text-2xl font-bold text-foreground">記事一覧</h1>
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
            すべての記事
          </h2>
          <p className="text-muted-foreground">
            保存した記事を検索・フィルタリングして管理できます。
          </p>
        </div>

        <ArticleList 
          initialGenres={genres}
          initialTags={tags}
        />
      </main>
    </div>
  )
}