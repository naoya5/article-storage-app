# 🤝 コントリビューションガイド

記事ストックアプリへのコントリビューションに興味を持っていただき、ありがとうございます！このドキュメントでは、プロジェクトに貢献する方法を説明します。

## 📋 コントリビューションの種類

以下の方法でプロジェクトに貢献できます：

- 🐛 **バグレポート**: 問題の報告
- 💡 **機能提案**: 新機能のアイデア
- 📝 **ドキュメント改善**: ドキュメントの修正・追加
- 🎨 **UI/UX改善**: デザインの改善提案
- 🔧 **コード貢献**: バグ修正や機能実装
- 🧪 **テスト追加**: テストカバレッジの改善

## 🚀 開発環境のセットアップ

### 1. リポジトリのフォーク・クローン

```bash
# リポジトリをフォーク後、ローカルにクローン
git clone https://github.com/your-username/article-storage-app.git
cd article-storage-app

# 元のリポジトリを upstream として追加
git remote add upstream https://github.com/original-owner/article-storage-app.git
```

### 2. 開発環境のセットアップ

詳細は [SETUP.md](./SETUP.md) を参照してください。

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集

# データベースのセットアップ
npx prisma migrate dev
npx prisma generate

# 開発サーバーの起動
npm run dev
```

## 🔄 開発ワークフロー

### 1. イシューの確認・作成

- 既存の [Issues](https://github.com/your-username/article-storage-app/issues) を確認
- 新しい機能やバグの場合、まずイシューを作成して議論
- `good first issue` ラベルの付いたイシューは初心者向け

### 2. ブランチの作成

```bash
# 最新の main ブランチに移動
git checkout main
git pull upstream main

# 機能別ブランチを作成
git checkout -b feature/amazing-feature
# または
git checkout -b fix/bug-description
```

### 3. 開発・テスト

```bash
# 開発中は定期的にコミット
git add .
git commit -m "feat: add amazing feature"

# リンター・型チェックの実行
npm run lint
npm run type-check

# テストの実行（実装時）
npm test
```

### 4. プルリクエストの作成

```bash
# フォークしたリポジトリにプッシュ
git push origin feature/amazing-feature
```

GitHub上でプルリクエストを作成します。

## 📝 コーディング規約

### TypeScript / JavaScript

- **ESLint** の設定に従う
- **TypeScript** の型安全性を保つ
- **関数・変数** は明確で説明的な名前を使用
- **コメント** は必要最小限に（コードが自己説明的になるように）

```typescript
// ❌ 悪い例
const d = new Date()
const u = users.filter(u => u.active)

// ✅ 良い例
const currentDate = new Date()
const activeUsers = users.filter(user => user.isActive)
```

### React コンポーネント

- **関数コンポーネント** を使用
- **TypeScript** で props の型を定義
- **再利用可能** なコンポーネント設計
- **パフォーマンス** を考慮（useMemo, useCallback等）

```typescript
// ✅ 良い例
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({ variant, size, children, ...props }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

### CSS / Tailwind

- **Tailwind CSS** のユーティリティクラスを使用
- **responsive** デザインを考慮
- **カスタムクラス** は最小限に抑える

### API設計

- **RESTful** な設計
- **適切なHTTPステータス** コードを使用
- **エラーハンドリング** の実装
- **バリデーション** の実装

```typescript
// ✅ 良い例
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }
    
    // 処理の実装
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    )
  }
}
```

## 🧪 テストガイドライン

### テスト作成の方針

- **ユニットテスト**: 個別の関数・コンポーネント
- **統合テスト**: API エンドポイント
- **E2Eテスト**: 主要なユーザーフロー（将来実装）

### テスト例

```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary" size="md">Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
  
  it('applies correct CSS classes', () => {
    render(<Button variant="primary" size="lg">Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-primary', 'btn-lg')
  })
})
```

## 📋 プルリクエストのガイドライン

### PR作成前のチェックリスト

- [ ] コードがESLintルールに準拠している
- [ ] TypeScriptの型エラーがない
- [ ] 関連するテストが追加・更新されている
- [ ] ドキュメントが必要に応じて更新されている
- [ ] 破壊的変更がある場合、理由が明記されている

### PRテンプレート

```markdown
## 概要
<!-- 変更内容の簡潔な説明 -->

## 変更内容
- [ ] 新機能追加
- [ ] バグ修正
- [ ] リファクタリング
- [ ] ドキュメント更新
- [ ] その他:

## 関連Issue
Closes #123

## テスト
<!-- 実施したテスト内容 -->

## スクリーンショット（UI変更の場合）
<!-- Before/After のスクリーンショット -->

## その他の注意事項
<!-- レビュワーが知っておくべき情報 -->
```

## 🐛 バグレポートのガイドライン

### 良いバグレポートの要素

1. **明確なタイトル**: 問題を端的に表現
2. **再現手順**: ステップバイステップで記載
3. **期待する動作**: 本来どうあるべきか
4. **実際の動作**: 何が起こっているか
5. **環境情報**: OS、ブラウザ、Node.jsバージョン等
6. **スクリーンショット**: 可能であれば添付

### バグレポートテンプレート

```markdown
## バグの概要
<!-- 問題の簡潔な説明 -->

## 再現手順
1. ...
2. ...
3. ...

## 期待する動作
<!-- 本来どうあるべきか -->

## 実際の動作
<!-- 何が起こっているか -->

## 環境
- OS: [e.g., macOS 13.0]
- ブラウザ: [e.g., Chrome 118]
- Node.js: [e.g., v18.17.0]

## 追加情報
<!-- スクリーンショット、ログ等 -->
```

## 💡 機能提案のガイドライン

### 良い機能提案の要素

1. **背景・動機**: なぜその機能が必要か
2. **具体的な提案**: どのような機能か
3. **期待する効果**: ユーザーにとってのメリット
4. **実装の考慮事項**: 技術的な課題や制約
5. **代替案**: 他の解決方法があるか

## 🎯 優先度とラベル

### ラベルの説明

- `good first issue`: 初心者向けのタスク
- `bug`: バグ修正
- `enhancement`: 新機能・改善
- `documentation`: ドキュメント関連
- `help wanted`: コントリビューション募集中
- `priority: high`: 優先度高
- `priority: medium`: 優先度中
- `priority: low`: 優先度低

## 📞 質問・サポート

- **GitHub Discussions**: 一般的な質問・議論
- **Issues**: バグレポート・機能提案
- **Discord**: リアルタイムチャット（設定済みの場合）

## 🏆 貢献者の認定

- プルリクエストがマージされた貢献者は `CONTRIBUTORS.md` に記載
- 継続的な貢献者には maintainer 権限を付与する場合があります

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**ご質問やご不明な点がございましたら、お気軽にIssuesやDiscussionsでお尋ねください！**

**皆様のコントリビューションを心よりお待ちしております 🙏**