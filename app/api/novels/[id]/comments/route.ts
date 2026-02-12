import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1, "コメントを入力してください"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = commentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: (session.user as any).id,
        novelId: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "コメントの投稿に失敗しました" },
      { status: 500 }
    )
  }
}
