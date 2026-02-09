import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const novelSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  content: z.string().min(1, "本文を入力してください"),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const authorId = searchParams.get("authorId")

    // 自分の投稿を見る場合は全て表示、それ以外は公開済みのみ
    const where: any = authorId 
      ? { authorId } 
      : { status: "APPROVED" }

    const novels = await prisma.novel.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
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

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content } = novelSchema.parse(body)

    const novel = await prisma.novel.create({
      data: {
        title,
        content,
        status: "PENDING", // 投稿時は未承認状態
        authorId: (session.user as any).id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(novel, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error("Error creating novel:", error)
    return NextResponse.json(
      { error: "小説の投稿に失敗しました" },
      { status: 500 }
    )
  }
}
