export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET() {
  // 簡単なセキュリティトークン（環境変数で設定可能）
  const SETUP_TOKEN = process.env.SETUP_TOKEN || "setup123"
  
  try {
    const prisma = new PrismaClient({
      log: ['error']
    })

    // 既存の管理者をチェック
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    })

    if (existingAdmin) {
      await prisma.$disconnect()
      return NextResponse.json({
        success: true,
        message: "Admin already exists",
        email: existingAdmin.email
      })
    }

    // 管理者を作成
    const hashedPassword = await bcrypt.hash("admin123", 10)
    
    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "管理者",
        password: hashedPassword,
        role: "ADMIN"
      }
    })

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully!",
      email: admin.email,
      password: "admin123",
      warning: "Please change the password after first login!"
    })
  } catch (error: any) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Setup failed",
        message: error.message
      },
      { status: 500 }
    )
  }
}
