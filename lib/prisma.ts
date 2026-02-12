import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Convert direct Supabase URL to pooler URL for Vercel compatibility
function getPoolerUrl(directUrl: string): string {
  try {
    // Parse: postgresql://postgres:password@db.PROJECT_REF.supabase.co:5432/postgres
    const match = directUrl.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:5432\/(.+)/)
    if (match) {
      const [, user, password, projectRef, database] = match
      // Use pooler with pgbouncer mode (transaction pooling)
      return `postgresql://${user}.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/${database}?pgbouncer=true&connection_limit=1`
    }
  } catch (e) {
    // If parsing fails, return original URL with connection params
  }
  return directUrl + (directUrl.includes('?') ? '&' : '?') + 'connection_limit=1&pool_timeout=0'
}

const databaseUrl = getPoolerUrl(process.env.DATABASE_URL || '')

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
