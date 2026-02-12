import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Convert Supabase direct connection to pooler URL for Vercel compatibility
function getSupabasePoolerUrl(url: string): string {
  // Parse: postgresql://postgres:password@db.PROJECT_REF.supabase.co:5432/postgres
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:5432\/(.+?)(?:\?|$)/)
  if (!match) {
    // Not a Supabase direct URL, return as-is with connection params
    return url + (url.includes('?') ? '&' : '?') + 'connection_limit=1'
  }

  const [, user, password, projectRef, database] = match
  
  // Try most common regions in order: us-east-1 (default), eu-west-1, ap-southeast-1, ap-northeast-1
  // For now, use us-east-1 as it's the most common
  // Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/[DATABASE]?pgbouncer=true
  return `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/${database}?pgbouncer=true&connection_limit=1`
}

const connectionUrl = getSupabasePoolerUrl(process.env.DATABASE_URL || '')

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
