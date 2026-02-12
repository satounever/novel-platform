export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"

// Same conversion function from lib/prisma.ts
function getPoolerUrl(directUrl: string): string {
  try {
    const match = directUrl.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:5432\/(.+)/)
    if (match) {
      const [, user, password, projectRef, database] = match
      return `postgresql://${user}.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/${database}?pgbouncer=true&connection_limit=1`
    }
  } catch (e) {
    // ignore
  }
  return directUrl + (directUrl.includes('?') ? '&' : '?') + 'connection_limit=1&pool_timeout=0'
}

export async function GET() {
  const originalUrl = process.env.DATABASE_URL || ''
  const poolerUrl = getPoolerUrl(originalUrl)
  
  return NextResponse.json({
    originalUrl: originalUrl.substring(0, 60) + '...',
    poolerUrl: poolerUrl.substring(0, 80) + '...',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  })
}
