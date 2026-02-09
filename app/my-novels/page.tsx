"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface Novel {
  id: string
  title: string
  content: string
  status: string
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
}

export default function MyNovelsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchMyNovels()
    }
  }, [status, session])

  const fetchMyNovels = async () => {
    try {
      const userId = (session?.user as any)?.id
      const response = await fetch(`/api/novels?authorId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setNovels(data)
      }
    } catch (error) {
      console.error("Error fetching novels:", error)
    } finally {
      setLoading(false)
    }
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "公開中"
      case "PENDING":
        return "承認待ち"
      case "REJECTED":
        return "却下"
      default:
        return status
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">マイ投稿</h1>
            <p className="mt-2 text-gray-600">あなたが投稿した小説</p>
          </div>
          <Link
            href="/novels/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            新規投稿
          </Link>
        </div>

        {novels.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">まだ投稿した小説がありません</p>
            <Link
              href="/novels/new"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              最初の小説を投稿する
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/novels/${novel.id}`} className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
                      {novel.title}
                    </h2>
                  </Link>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(novel.status)}`}>
                    {getStatusText(novel.status)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {truncateContent(novel.content)}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex space-x-4">
                    <span>❤️ {novel._count.likes}</span>
                    <span>💬 {novel._count.comments}</span>
                  </div>
                  <span className="text-xs">
                    {new Date(novel.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/novels/${novel.id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    編集
                  </Link>
                  <Link
                    href={`/novels/${novel.id}`}
                    className="flex-1 text-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
