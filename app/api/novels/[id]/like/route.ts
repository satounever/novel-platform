import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
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

    const userId = (session.user as any).id

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_novelId: {
          userId,
          novelId: params.id
        }
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { error: "既にいいね済みです" },
        { status: 400 }
      )
    }

    const like = await prisma.like.create({
      data: {
        userId,
        novelId: params.id
      }
    })

    return NextResponse.json(like, { status: 201 })
  } catch (error) {
    console.error("Error creating like:", error)
    return NextResponse.json(
      { error: "いいねに失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
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

    const userId = (session.user as any).id

    await prisma.like.deleteMany({
      where: {
        userId,
        novelId: params.id
      }
    })

    return NextResponse.json({ message: "いいねを取り消しました" })
  } catch (error) {
    console.error("Error deleting like:", error)
    return NextResponse.json(
      { error: "いいねの取り消しに失敗しました" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ liked: false })
    }

    const userId = (session.user as any).id

    const like = await prisma.like.findUnique({
      where: {
        userId_novelId: {
          userId,
          novelId: params.id
        }
      }
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error("Error checking like:", error)
    return NextResponse.json(
      { error: "いいね状態の取得に失敗しました" },
      { status: 500 }
    )
  }
}
