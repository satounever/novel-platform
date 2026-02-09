import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    const novels = await prisma.novel.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(novels)
  } catch (error) {
    console.error("Error fetching novels:", error)
    return NextResponse.json(
      { error: "小説一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      )
    }

    const { novelId, status } = await request.json()

    if (!novelId || !status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "無効なリクエストです" },
        { status: 400 }
      )
    }

    const novel = await prisma.novel.update({
      where: { id: novelId },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(novel)
  } catch (error) {
    console.error("Error updating novel:", error)
    return NextResponse.json(
      { error: "小説の更新に失敗しました" },
      { status: 500 }
    )
  }
}
