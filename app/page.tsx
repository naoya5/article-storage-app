import { AuthButton } from "./components/auth-button";
import { DarkModeToggle } from "./components/dark-mode-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-10 w-48 h-48 bg-primary/20 dark:bg-primary/10 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/20 dark:bg-primary/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 right-32 w-32 h-32 bg-primary/20 dark:bg-primary/10 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 bg-background/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm border-b border-border dark:border-gray-700 animate-slide-down">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-300">
            📚 記事ストックアプリ
          </h1>
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
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              記事を
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent animate-gradient">
                スマートに
              </span>
              管理
            </h1>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Twitter、Zenn、Qiitaから記事をストックして、ジャンル別・プラットフォーム別に整理。
              <br />
              <span className="text-primary font-semibold">AI が学習を効率化</span>します。
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link 
              href="/articles" 
              className="group inline-flex items-center px-8 py-4 text-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-2">🚀</span>
              今すぐ始める
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-8 py-4 text-xl font-semibold text-primary bg-background/80 dark:bg-gray-800/80 hover:bg-background dark:hover:bg-gray-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-border dark:border-gray-700 transform hover:scale-105"
            >
              <span className="mr-2">📊</span>
              ダッシュボード
            </Link>
          </div>

          {/* Feature highlights with staggered animation */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="animate-fade-in-up bg-card/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 group hover:border-primary/50" style={{ animationDelay: '0.8s' }}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📚</div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">一元管理</h3>
              <p className="text-muted-foreground leading-relaxed">
                複数のプラットフォームの記事を一箇所で管理。検索・フィルタ機能で必要な記事をすぐに見つけられます。
              </p>
            </div>
            
            <div className="animate-fade-in-up bg-card/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 group hover:border-primary/50" style={{ animationDelay: '1.0s' }}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">スマート分類</h3>
              <p className="text-muted-foreground leading-relaxed">
                ジャンル・タグによる柔軟な分類システム。お気に入り機能や読書ステータスで進捗管理も可能です。
              </p>
            </div>
            
            <div className="animate-fade-in-up bg-card/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 group hover:border-primary/50" style={{ animationDelay: '1.2s' }}>
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📈</div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">学習効率化</h3>
              <p className="text-muted-foreground leading-relaxed">
                統計データで学習パターンを可視化。月別の追加記事数や読書進捗で学習効率を向上させます。
              </p>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-32 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
            <div className="bg-primary/10 backdrop-blur-sm rounded-3xl p-12 border border-primary/30">
              <h2 className="text-4xl font-bold text-foreground mb-12">あなたの学習をサポート</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">∞</div>
                  <div className="text-muted-foreground">無制限ストック</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-muted-foreground">いつでもアクセス</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">🔍</div>
                  <div className="text-muted-foreground">高速検索</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">📱</div>
                  <div className="text-muted-foreground">マルチデバイス</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
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

      {/* Footer */}
      <footer className="relative z-10 bg-foreground/10 dark:bg-gray-950 text-foreground p-8 mt-20 animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">記事ストックアプリ</h3>
              <p className="text-muted-foreground">効率的な学習のための記事管理プラットフォーム</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">機能</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/articles" className="hover:text-primary transition-colors">記事一覧</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">ダッシュボード</Link></li>
                <li><Link href="/favorites" className="hover:text-primary transition-colors">お気に入り</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>プラットフォーム: Twitter, Zenn, Qiita</li>
                <li>ダークモード対応</li>
                <li>レスポンシブデザイン</li>
              </ul>
            </div>
          </div>
          <div className="text-center border-t border-border pt-8">
            <p>&copy; 2025 記事ストックアプリ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}