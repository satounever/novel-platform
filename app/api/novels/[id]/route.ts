import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const novelSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  content: z.string().min(1, "本文を入力してください"),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        _count: {
          select: {
            likes: true,
          }
        }
      }
    })

    if (!novel) {
      return NextResponse.json(
        { error: "小説が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(novel)
  } catch (error) {
    console.error("Error fetching novel:", error)
    return NextResponse.json(
      { error: "小説の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const { id } = await params
    const novel = await prisma.novel.findUnique({
      where: { id }
    })

    if (!novel) {
      return NextResponse.json(
        { error: "小説が見つかりません" },
        { status: 404 }
      )
    }

    if (novel.authorId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "編集権限がありません" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content } = novelSchema.parse(body)

    const updatedNovel = await prisma.novel.update({
      where: { id },
      data: { title, content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(updatedNovel)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    console.error("Error updating novel:", error)
    return NextResponse.json(
      { error: "小説の更新に失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const { id } = await params
    const novel = await prisma.novel.findUnique({
      where: { id }
    })

    if (!novel) {
      return NextResponse.json(
        { error: "小説が見つかりません" },
        { status: 404 }
      )
    }

    const isAdmin = (session.user as any).role === "ADMIN"
    if (novel.authorId !== (session.user as any).id && !isAdmin) {
      return NextResponse.json(
        { error: "削除権限がありません" },
        { status: 403 }
      )
    }

    await prisma.novel.delete({
      where: { id }
    })

    return NextResponse.json({ message: "削除しました" })
  } catch (error) {
    console.error("Error deleting novel:", error)
    return NextResponse.json(
      { error: "小説の削除に失敗しました" },
      { status: 500 }
    )
  }
}
