export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    databaseUrl: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 50) + '...' : 
      'NOT SET',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  })
}
