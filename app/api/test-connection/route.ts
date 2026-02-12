export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"

// Same conversion function
function getSupabasePoolerUrl(url: string): string {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co:5432\/(.+?)(?:\?|$)/)
  if (!match) {
    return url + (url.includes('?') ? '&' : '?') + 'connection_limit=1'
  }

  const [, user, password, projectRef, database] = match
  return `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/${database}?pgbouncer=true&connection_limit=1`
}

export async function GET() {
  const originalUrl = process.env.DATABASE_URL || ''
  const poolerUrl = getSupabasePoolerUrl(originalUrl)
  
  return NextResponse.json({
    step: "Connection URL conversion test",
    originalUrl: originalUrl.substring(0, 70),
    poolerUrl: poolerUrl.substring(0, 90),
    conversion: {
      isSupabaseUrl: originalUrl.includes('supabase.co:5432'),
      hasPoolerUrl: poolerUrl.includes('pooler.supabase.com:6543'),
      region: 'us-east-1'
    }
  })
}
