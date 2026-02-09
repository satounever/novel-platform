"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center text-xl font-bold text-gray-900">
              小説プラットフォーム
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <span className="text-gray-500">読み込み中...</span>
            ) : session ? (
              <>
                <span className="text-gray-700">{session.user?.name}</span>
                <Link
                  href="/novels/new"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  投稿する
                </Link>
                {(session.user as any)?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    管理画面
                  </Link>
                )}
                <Link
                  href="/my-novels"
                  className="text-gray-700 hover:text-gray-900"
                >
                  マイ投稿
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
