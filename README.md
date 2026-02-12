# 小説投稿プラットフォーム

承認制の小説投稿サイト。ユーザーが小説を投稿し、管理者が承認したものだけが公開されます。

## 機能

- ✅ ユーザー登録・ログイン（メール+パスワード）
- ✅ 誰でも小説を投稿可能（投稿時は未承認状態）
- ✅ 管理者による小説の承認/却下
- ✅ 承認された小説のみ公開
- ✅ いいね・コメント機能
- ✅ スマホ対応レスポンシブデザイン

## 技術スタック

- **フレームワーク:** Next.js 14 (App Router)
- **データベース:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **認証:** NextAuth.js
- **スタイリング:** Tailwind CSS
- **デプロイ:** Vercel

## ローカル開発

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、必要な値を設定：

```bash
cp .env.example .env
```

### 3. データベースをセットアップ

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. 管理者ユーザーを作成

データベースに直接管理者ユーザーを作成するか、登録後にPrisma Studioで `role` を `ADMIN` に変更：

```bash
npx prisma studio
```

### 5. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## Vercel デプロイ

### 1. Supabase でデータベースを作成

1. [Supabase](https://supabase.com) にサインアップ
2. 新しいプロジェクトを作成
3. 接続文字列（DATABASE_URL）をコピー

### 2. GitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Vercel にデプロイ

⚠️ **重要:** DATABASE_URLは必ずSupabase Pooler接続を使用してください

1. [Vercel](https://vercel.com) にサインアップ
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定：
   - `DATABASE_URL`: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
   - `NEXTAUTH_URL`: デプロイ後のURL
   - `NEXTAUTH_SECRET`: ランダムな文字列（`openssl rand -base64 32` で生成）
5. 「Deploy」をクリック

📖 詳細は [DEPLOY.md](./DEPLOY.md) を参照

### 4. データベースをマイグレート

Vercelのダッシュボードから、または以下のコマンドで：

```bash
npx prisma migrate deploy
```

### 5. 管理者ユーザーを作成

Prisma Studio を使用：

```bash
npx prisma studio
```

または、Supabaseのダッシュボードから直接SQLを実行。

## 管理画面

管理者でログイン後、「管理画面」リンクから：

- **小説承認タブ:** 未承認の小説を確認し、公開/却下を選択
- **ユーザー管理タブ:** ユーザーの承認状態を管理

## ライセンス

MIT
