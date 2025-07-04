import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DarkModeToggle } from "@/app/components/dark-mode-toggle"
import { AddArticleWithPreview } from "@/app/components/add-article-with-preview"
import { authOptions } from "@/lib/auth"
import * as React from "react"

export const dynamic = "force-dynamic"

export default async function AddArticlePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-background/90 dark:bg-gray-900/90 backdrop-blur-sm border-border dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/articles"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                ← 記事一覧
              </Link>
              <h1 className="text-2xl font-bold text-foreground">記事を追加</h1>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <AddArticleWithPreview />
      </main>
    </div>
  )
}