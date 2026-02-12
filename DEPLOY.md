# Vercel デプロイガイド

## 🔥 重要：DATABASE_URLの設定

SupabaseをVercelで使う場合、**必ずPooler接続を使用してください**。

### 正しいDATABASE_URL形式：

```
postgresql://postgres.gbtuphvhcmvugllcdift:7dqmS-8dRK4cN%25X@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**重要なポイント：**
- ✅ ホスト: `aws-0-ap-northeast-1.pooler.supabase.com` (Pooler URL)
- ✅ ポート: `6543` (Poolerポート、5432ではない)
- ✅ クエリパラメータ: `?pgbouncer=true&connection_limit=1` (必須)
- ✅ パスワードの`%`は`%25`にエンコード

### Vercel環境変数の更新手順：

1. https://vercel.com/satounevers-projects/novel-platform/settings/environment-variables にアクセス
2. `DATABASE_URL` を編集
3. 上記の正しいURLに変更
4. 「Save」をクリック
5. Deployments → 最新のデプロイ → 「Redeploy」をクリック

## エラー原因

❌ **間違い（直接接続、Serverlessでは動かない）:**
```
postgresql://postgres:password@db.gbtuphvhcmvugllcdift.supabase.co:5432/postgres
```

✅ **正しい（Pooler接続、Serverlessで動く）:**
```
postgresql://postgres.gbtuphvhcmvugllcdift:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## 完了後の確認

再デプロイ後、以下をテスト：
- https://novel-platform-woad.vercel.app にアクセス
- ログインページが表示される
- 登録ができる
- データベースエラーが出ない
