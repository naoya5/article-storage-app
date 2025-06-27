import { AuthButton } from "./components/auth-button";
import { DarkModeToggle } from "./components/dark-mode-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <header className="p-6 bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">記事ストックアプリ</h1>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            記事を一元管理して効率的に学習
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Twitter、Zenn、Qiitaから記事をストックして、ジャンル別・プラットフォーム別に整理。
            お気に入りの記事を見つけて、学習を効率化しましょう。
          </p>
          
          <div className="mb-8">
            <Link 
              href="/articles" 
              className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
            >
              📚 記事一覧を見る
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Link href="/total-articles" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border dark:border-slate-700">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">総記事数</h3>
              <p className="text-gray-600 dark:text-gray-300">
                登録済み記事の総数とプラットフォーム別の内訳を確認できます。
              </p>
            </Link>
            
            <Link href="/monthly-articles" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border dark:border-slate-700">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">今月追加</h3>
              <p className="text-gray-600 dark:text-gray-300">
                今月の新規追加記事数と追加パターンを分析できます。
              </p>
            </Link>
            
            <Link href="/favorites" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border dark:border-slate-700">
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">お気に入り</h3>
              <p className="text-gray-600 dark:text-gray-300">
                ブックマーク済み記事と読書ステータス、評価分布を確認できます。
              </p>
            </Link>
            
            <Link href="/dashboard" className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-white">
              <div className="text-3xl mb-4">🎛️</div>
              <h3 className="text-lg font-semibold mb-2">ダッシュボード</h3>
              <p className="text-green-100">
                記事の管理、ジャンル・タグの編集、統計情報を確認できます。
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 dark:bg-slate-950 text-white p-6 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2025 記事ストックアプリ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}