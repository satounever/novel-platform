export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // 管理者ユーザーが既に存在するかチェック
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin already exists",
        email: existingAdmin.email
      })
    }

    // 管理者ユーザーを作成
    const hashedPassword = await bcrypt.hash("admin123", 10)
    
    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "管理者",
        password: hashedPassword,
        role: "ADMIN"
      }
    })

    return NextResponse.json({
      message: "Admin user created successfully",
      email: admin.email,
      password: "admin123",
      warning: "Please change the password after first login!"
    })
  } catch (error: any) {
    console.error("Init error:", error)
    return NextResponse.json(
      { 
        error: "Initialization failed",
        message: error.message
      },
      { status: 500 }
    )
  }
}
