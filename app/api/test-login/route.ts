export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email') || 'admin@example.com'
  const password = searchParams.get('password') || 'admin123'

  try {
    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        email
      })
    }

    // パスワードを比較
    const passwordsMatch = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      success: true,
      userFound: true,
      passwordMatch: passwordsMatch,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      passwordLength: user.password.length,
      passwordStart: user.password.substring(0, 20)
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
