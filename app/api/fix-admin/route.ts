export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 既存のadminを削除
    await prisma.user.deleteMany({
      where: { email: 'admin@example.com' }
    })

    // 新しい管理者を作成
    const admin = await prisma.user.create({
      data: {
        id: 'admin-test-001',
        email: 'admin@novel.com',
        name: '管理者',
        password: '$2b$10$V3hccU2c3xSbGBqtCKe09.wMOILk.HOnzu2J.ddP5bGs5lwrIttqG',
        role: 'ADMIN'
      }
    })

    // テストユーザーを作成
    const testUser = await prisma.user.create({
      data: {
        id: 'user-test-001',
        email: 'test@novel.com',
        name: 'テストユーザー',
        password: '$2b$10$V3hccU2c3xSbGBqtCKe09.wMOILk.HOnzu2J.ddP5bGs5lwrIttqG',
        role: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        password: 'admin123'
      },
      testUser: {
        email: testUser.email,
        password: 'admin123'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message
      },
      { status: 500 }
    )
  }
}
