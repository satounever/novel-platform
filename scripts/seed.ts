import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('シードデータを作成中...')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })

  if (existingAdmin) {
    console.log('管理者ユーザーは既に存在します')
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理者',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('管理者ユーザーを作成しました:')
  console.log('メール: admin@example.com')
  console.log('パスワード: admin123')
  console.log('')
  console.log('⚠️  本番環境では必ずパスワードを変更してください!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
