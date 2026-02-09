"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: {
    novels: number
  }
}

interface Novel {
  id: string
  title: string
  content: string
  status: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<"users" | "novels">("novels")
  const [users, setUsers] = useState<User[]>([])
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedNovel, setExpandedNovel] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchUsers()
      fetchNovels()
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNovels = async () => {
    try {
      const response = await fetch("/api/admin/novels")
      if (response.ok) {
        const data = await response.json()
        setNovels(data)
      }
    } catch (error) {
      console.error("Error fetching novels:", error)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setUpdating(null)
    }
  }

  const updateNovelStatus = async (novelId: string, status: string) => {
    setUpdating(novelId)
    try {
      const response = await fetch("/api/admin/novels", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ novelId, status }),
      })

      if (response.ok) {
        fetchNovels()
      }
    } catch (error) {
      console.error("Error updating novel:", error)
    } finally {
      setUpdating(null)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
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

  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "管理者"
      case "APPROVED":
        return "承認済み"
      case "PENDING":
        return "承認待ち"
      case "REJECTED":
        return "却下"
      default:
        return role
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "公開"
      case "PENDING":
        return "未承認"
      case "REJECTED":
        return "却下"
      default:
        return status
    }
  }

  const pendingNovels = novels.filter(n => n.status === "PENDING")
  const approvedNovels = novels.filter(n => n.status === "APPROVED")
  const rejectedNovels = novels.filter(n => n.status === "REJECTED")

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理画面</h1>
          <p className="mt-2 text-gray-600">ユーザーと小説の管理</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("novels")}
              className={`${
                activeTab === "novels"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              小説承認 {pendingNovels.length > 0 && `(${pendingNovels.length})`}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              ユーザー管理
            </button>
          </nav>
        </div>

        {/* Novels Tab */}
        {activeTab === "novels" && (
          <div className="space-y-6">
            {/* Pending Novels */}
            {pendingNovels.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">未承認の小説 ({pendingNovels.length}件)</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
                  {pendingNovels.map((novel) => (
                    <div key={novel.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{novel.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(novel.status)}`}>
                              {getStatusText(novel.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            著者: {novel.author.name} ({novel.author.email})
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(novel.createdAt).toLocaleString("ja-JP")}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => updateNovelStatus(novel.id, "APPROVED")}
                            disabled={updating === novel.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            公開
                          </button>
                          <button
                            onClick={() => updateNovelStatus(novel.id, "REJECTED")}
                            disabled={updating === novel.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            却下
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setExpandedNovel(expandedNovel === novel.id ? null : novel.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          {expandedNovel === novel.id ? "内容を隠す ▲" : "内容を確認 ▼"}
                        </button>
                        {expandedNovel === novel.id && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-md max-h-96 overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{novel.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Novels */}
            {approvedNovels.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">公開中の小説 ({approvedNovels.length}件)</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイトル</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">著者</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">いいね</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">投稿日</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvedNovels.map((novel) => (
                        <tr key={novel.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <Link href={`/novels/${novel.id}`} className="hover:text-indigo-600">
                              {novel.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{novel.author.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{novel._count.likes}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(novel.createdAt).toLocaleDateString("ja-JP")}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => updateNovelStatus(novel.id, "REJECTED")}
                              disabled={updating === novel.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              非公開
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Rejected Novels */}
            {rejectedNovels.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">却下した小説 ({rejectedNovels.length}件)</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイトル</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">著者</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">投稿日</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rejectedNovels.map((novel) => (
                        <tr key={novel.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{novel.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{novel.author.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(novel.createdAt).toLocaleDateString("ja-JP")}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => updateNovelStatus(novel.id, "APPROVED")}
                              disabled={updating === novel.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              公開
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {novels.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">まだ小説がありません</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    投稿数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count.novels}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.role === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateUserRole(user.id, "APPROVED")}
                            disabled={updating === user.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => updateUserRole(user.id, "REJECTED")}
                            disabled={updating === user.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            却下
                          </button>
                        </>
                      )}
                      {user.role === "APPROVED" && (
                        <button
                          onClick={() => updateUserRole(user.id, "REJECTED")}
                          disabled={updating === user.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          無効化
                        </button>
                      )}
                      {user.role === "REJECTED" && (
                        <button
                          onClick={() => updateUserRole(user.id, "APPROVED")}
                          disabled={updating === user.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          再承認
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
