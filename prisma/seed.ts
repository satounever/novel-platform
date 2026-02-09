import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

// Read DATABASE_URL from .env file
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const databaseUrl = envContent
  .split('\n')
  .find(line => line.startsWith('DATABASE_URL='))
  ?.split('=')[1]
  ?.replace(/"/g, '')

if (!databaseUrl) {
  throw new Error('DATABASE_URL not found in .env file')
}

const prisma = new PrismaClient({
  datasourceUrl: databaseUrl
})

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
