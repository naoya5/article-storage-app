import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardTabs } from "./dashboard-tabs"
import type { Genre, Tag } from "@/types/api"

export const dynamic = "force-dynamic"

// Server Componentでデータフェッチング
async function getDashboardData(userId: string) {
  const [genres, tags, stats] = await Promise.all([
    // ジャンル取得
    prisma.genre.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }),
    
    // タグ取得
    prisma.tag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    }),
    
    // 統計情報取得
    Promise.all([
      prisma.article.count({ where: { userId } }),
      prisma.article.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.bookmark.count({
        where: {
          userId,
          isFavorite: true
        }
      })
    ]).then(([total, monthly, bookmarked]) => ({
      totalArticles: total,
      monthlyArticles: monthly,
      bookmarkedArticles: bookmarked
    }))
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
    })) as Tag[],
    stats
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/")
  }

  const { genres, tags, stats } = await getDashboardData(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <div className="text-sm text-gray-600">
              ようこそ、{session.user?.name || session.user?.email}さん
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* タブ管理とコンテンツ - Client Component */}
        <DashboardTabs 
          initialGenres={genres}
          initialTags={tags}
          session={session}
        />

        {/* 統計情報 - Server Component */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              総記事数
            </h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalArticles}</p>
            <p className="text-sm text-gray-500">登録済み記事</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              今月追加
            </h3>
            <p className="text-3xl font-bold text-green-600">{stats.monthlyArticles}</p>
            <p className="text-sm text-gray-500">今月の新規追加</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              お気に入り
            </h3>
            <p className="text-3xl font-bold text-purple-600">{stats.bookmarkedArticles}</p>
            <p className="text-sm text-gray-500">ブックマーク済み</p>
          </div>
        </div>
      </main>
    </div>
  )
}
