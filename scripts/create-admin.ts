import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// DATABASE_URLは環境変数から自動的に読み込まれます
const prisma = new PrismaClient({
  log: ['error']
})

async function main() {
  try {
    // 既存の管理者をチェック
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ 管理者は既に存在します:', existingAdmin.email)
      return
    }

    // 管理者を作成
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: '管理者',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ 管理者ユーザーを作成しました!')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123')
    console.log('⚠️  初回ログイン後にパスワードを変更してください!')
  } catch (error) {
    console.error('❌ エラー:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
