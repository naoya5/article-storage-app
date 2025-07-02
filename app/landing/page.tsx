import { AuthButton } from "../components/auth-button";
import { DarkModeToggle } from "../components/dark-mode-toggle";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-10 w-48 h-48 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-300/20 dark:bg-purple-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 right-32 w-32 h-32 bg-blue-400/20 dark:bg-blue-600/10 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 animate-slide-down">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
            📚 記事ストックアプリ
          </Link>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          {/* Main heading with animation */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              記事を
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
                スマートに
              </span>
              管理
            </h1>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Twitter、Zenn、Qiitaから記事をストックして、ジャンル別・プラットフォーム別に整理。
              <br />
              <span className="text-blue-600 dark:text-blue-400 font-semibold">AI が学習を効率化</span>します。
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link 
              href="/articles" 
              className="group inline-flex items-center px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-2">🚀</span>
              今すぐ始める
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-8 py-4 text-xl font-semibold text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-200 dark:border-blue-700 transform hover:scale-105"
            >
              <span className="mr-2">📊</span>
              ダッシュボード
            </Link>
          </div>

          {/* Feature highlights with staggered animation */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="animate-fade-in-up bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 group hover:border-blue-300/50 dark:hover:border-blue-600/50" style={{ animationDelay: '0.8s' }}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📚</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">一元管理</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                複数のプラットフォームの記事を一箇所で管理。検索・フィルタ機能で必要な記事をすぐに見つけられます。
              </p>
            </div>
            
            <div className="animate-fade-in-up bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 group hover:border-blue-300/50 dark:hover:border-blue-600/50" style={{ animationDelay: '1.0s' }}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">スマート分類</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                ジャンル・タグによる柔軟な分類システム。お気に入り機能や読書ステータスで進捗管理も可能です。
              </p>
            </div>
            
            <div className="animate-fade-in-up bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 group hover:border-blue-300/50 dark:hover:border-blue-600/50" style={{ animationDelay: '1.2s' }}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📈</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">学習効率化</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                統計データで学習パターンを可視化。月別の追加記事数や読書進捗で学習効率を向上させます。
              </p>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-32 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
            <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 backdrop-blur-sm rounded-3xl p-12 border border-blue-200/30 dark:border-blue-700/30">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">あなたの学習をサポート</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">∞</div>
                  <div className="text-gray-600 dark:text-gray-300">無制限ストック</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-gray-600 dark:text-gray-300">いつでもアクセス</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">🔍</div>
                  <div className="text-gray-600 dark:text-gray-300">高速検索</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300">📱</div>
                  <div className="text-gray-600 dark:text-gray-300">マルチデバイス</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-800 dark:bg-gray-950 text-white p-8 mt-20 animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">記事ストックアプリ</h3>
              <p className="text-gray-300">効率的な学習のための記事管理プラットフォーム</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">機能</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/articles" className="hover:text-blue-400 transition-colors">記事一覧</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">ダッシュボード</Link></li>
                <li><Link href="/favorites" className="hover:text-blue-400 transition-colors">お気に入り</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-300">
                <li>プラットフォーム: Twitter, Zenn, Qiita</li>
                <li>ダークモード対応</li>
                <li>レスポンシブデザイン</li>
              </ul>
            </div>
          </div>
          <div className="text-center border-t border-gray-700 pt-8">
            <p>&copy; 2025 記事ストックアプリ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}