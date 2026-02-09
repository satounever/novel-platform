"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface Novel {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function HomePage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNovels()
  }, [])

  const fetchNovels = async () => {
    try {
      const response = await fetch("/api/novels")
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">小説一覧</h1>
          <p className="mt-2 text-gray-600">投稿された小説を閲覧できます</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">まだ投稿された小説がありません</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {novel.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {truncateContent(novel.content)}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>著者: {novel.author.name}</span>
                  <div className="flex space-x-4">
                    <span>❤️ {novel._count.likes}</span>
                    <span>💬 {novel._count.comments}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(novel.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
