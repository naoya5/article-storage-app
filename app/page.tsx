import { AuthButton } from "./components/auth-button";
import { DarkModeToggle } from "./components/dark-mode-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background dark:from-gray-900 dark:to-gray-800">
      <header className="p-6 bg-background/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm border-b border-border dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">記事ストックアプリ</h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/landing" 
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              ランディングページ
            </Link>
            <DarkModeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            記事を一元管理して効率的に学習
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Twitter、Zenn、Qiitaから記事をストックして、ジャンル別・プラットフォーム別に整理。
            お気に入りの記事を見つけて、学習を効率化しましょう。
          </p>
          
          <div className="mb-8">
            <Link 
              href="/articles" 
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              📚 記事一覧を見る
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Link href="/total-articles" className="block bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-border hover:border-primary/50">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">総記事数</h3>
              <p className="text-muted-foreground text-sm">
                登録済み記事の総数とプラットフォーム別の内訳を確認できます。
              </p>
            </Link>
            
            <Link href="/monthly-articles" className="block bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-border hover:border-primary/50">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">今月追加</h3>
              <p className="text-muted-foreground text-sm">
                今月の新規追加記事数と追加パターンを分析できます。
              </p>
            </Link>
            
            <Link href="/favorites" className="block bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-border hover:border-primary/50">
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">お気に入り</h3>
              <p className="text-muted-foreground text-sm">
                ブックマーク済み記事と読書ステータス、評価分布を確認できます。
              </p>
            </Link>
            
            <Link href="/dashboard" className="block bg-gradient-to-br from-primary to-primary/80 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-primary-foreground hover:from-primary/90 hover:to-primary/70">
              <div className="text-3xl mb-4">🎛️</div>
              <h3 className="text-lg font-semibold mb-2">ダッシュボード</h3>
              <p className="text-primary-foreground/80 text-sm">
                記事の管理、ジャンル・タグの編集、統計情報を確認できます。
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-foreground/10 dark:bg-gray-950 text-foreground p-6 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2025 記事ストックアプリ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}