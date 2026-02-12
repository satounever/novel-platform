const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// .envファイルを読み込む
const envPath = path.join(__dirname, '../.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1')
    process.env[key] = value
  }
})

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function main() {
  try {
    console.log('🔗 接続中...')
    await client.connect()
    console.log('✅ データベースに接続しました')

    // 既存の管理者をチェック
    const checkResult = await client.query(
      `SELECT id, email, role FROM "User" WHERE email = $1`,
      ['admin@example.com']
    )

    if (checkResult.rows.length > 0) {
      console.log('📧 既存の管理者:', checkResult.rows[0])
      
      // ロールとパスワードを更新
      await client.query(
        `UPDATE "User" SET role = $1, password = $2, "updatedAt" = NOW() WHERE email = $3`,
        ['ADMIN', '$2b$10$BDKqG6BozKx9wuAdMC2H5.dYYIuJrYd4oC6N8tFBJOdXOB7i3MuV6', 'admin@example.com']
      )
      console.log('✅ 管理者権限を更新しました')
    } else {
      // 新しい管理者を作成
      const id = 'admin_' + Math.random().toString(36).substring(2, 15)
      await client.query(
        `INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [id, '管理者', 'admin@example.com', '$2b$10$BDKqG6BozKx9wuAdMC2H5.dYYIuJrYd4oC6N8tFBJOdXOB7i3MuV6', 'ADMIN']
      )
      console.log('✅ 管理者ユーザーを作成しました!')
    }

    // 最終結果を表示
    const result = await client.query(
      `SELECT id, name, email, role, "createdAt" FROM "User" WHERE email = $1`,
      ['admin@example.com']
    )
    
    console.log('\n━━━━━━━━━━━━━━━━━━')
    console.log('✅ 管理者アカウント:')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123')
    console.log('━━━━━━━━━━━━━━━━━━\n')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

main()
