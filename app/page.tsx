import { AuthButton } from "./components/auth-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="p-6 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">記事ストックアプリ</h1>
          <AuthButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            記事を一元管理して効率的に学習
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Twitter、Zenn、Qiitaから記事をストックして、ジャンル別・プラットフォーム別に整理。
            お気に入りの記事を見つけて、学習を効率化しましょう。
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">記事をストック</h3>
              <p className="text-gray-600">
                URLを貼り付けるだけで、記事の情報を自動取得してストックできます。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🏷️</div>
              <h3 className="text-lg font-semibold mb-2">ジャンル別整理</h3>
              <p className="text-gray-600">
                カスタムジャンルやタグを使って、記事を効率的に分類・管理できます。
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">高速検索</h3>
              <p className="text-gray-600">
                タイトルや内容での全文検索で、必要な記事を素早く見つけられます。
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-6 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2025 記事ストックアプリ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}