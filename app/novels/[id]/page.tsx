"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/navbar"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface Novel {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
  }
  comments: Comment[]
  _count: {
    likes: number
  }
}

export default function NovelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [novel, setNovel] = useState<Novel | null>(null)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchNovel()
    if (session) {
      checkLikeStatus()
    }
  }, [params.id, session])

  const fetchNovel = async () => {
    try {
      const response = await fetch(`/api/novels/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setNovel(data)
      } else {
        alert("小説が見つかりません")
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching novel:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/novels/${params.id}/like`)
      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const toggleLike = async () => {
    if (!session) {
      alert("いいねするにはログインが必要です")
      router.push("/login")
      return
    }

    try {
      const method = liked ? "DELETE" : "POST"
      const response = await fetch(`/api/novels/${params.id}/like`, { method })
      
      if (response.ok) {
        setLiked(!liked)
        fetchNovel() // Refresh to update like count
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      alert("コメントするにはログインが必要です")
      router.push("/login")
      return
    }

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/novels/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentContent }),
      })

      if (response.ok) {
        setCommentContent("")
        fetchNovel() // Refresh to show new comment
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const deleteNovel = async () => {
    if (!confirm("本当に削除しますか？")) return

    try {
      const response = await fetch(`/api/novels/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("削除しました")
        router.push("/")
      } else {
        alert("削除に失敗しました")
      }
    } catch (error) {
      console.error("Error deleting novel:", error)
      alert("削除中にエラーが発生しました")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!novel) {
    return null
  }

  const isAuthor = session && (session.user as any)?.id === novel.author.id
  const isAdmin = session && (session.user as any)?.role === "ADMIN"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <article className="bg-white shadow rounded-lg p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {novel.title}
            </h1>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                <span>著者: {novel.author.name}</span>
                <span className="mx-2">•</span>
                <span>{new Date(novel.createdAt).toLocaleDateString("ja-JP")}</span>
              </div>
              {(isAuthor || isAdmin) && (
                <div className="space-x-4">
                  <button
                    onClick={() => router.push(`/novels/${novel.id}/edit`)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    編集
                  </button>
                  <button
                    onClick={deleteNovel}
                    className="text-red-600 hover:text-red-900"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-8 whitespace-pre-wrap">
            {novel.content}
          </div>

          <div className="flex items-center space-x-6 pt-6 border-t">
            <button
              onClick={toggleLike}
              className={`flex items-center space-x-2 ${
                liked ? "text-red-600" : "text-gray-600"
              } hover:text-red-600`}
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span>{novel._count.likes}</span>
            </button>
            <span className="text-gray-600">
              💬 {novel.comments.length}
            </span>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">コメント</h2>

          {session ? (
            <form onSubmit={submitComment} className="mb-8">
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="コメントを入力..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingComment ? "投稿中..." : "コメントする"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-md text-center">
              <p className="text-gray-600">
                コメントするには
                <button
                  onClick={() => router.push("/login")}
                  className="text-indigo-600 hover:text-indigo-900 mx-1"
                >
                  ログイン
                </button>
                が必要です
              </p>
            </div>
          )}

          <div className="space-y-6">
            {novel.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                まだコメントがありません
              </p>
            ) : (
              novel.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {comment.user.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
