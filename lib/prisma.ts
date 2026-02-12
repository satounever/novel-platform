import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimize database connection for Vercel/Serverless
const databaseUrl = process.env.DATABASE_URL || ''
const connectionUrl = databaseUrl + (databaseUrl.includes('?') ? '&' : '?') + 
  'connection_limit=1&pool_timeout=20&connect_timeout=60'

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
