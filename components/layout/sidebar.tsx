"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Video, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="w-60 min-h-screen border-r bg-gray-50">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Quest Stream Web App</h1>
      </div>
      <nav className="p-4 space-y-2">
        <Link
          href="/live"
          className={cn(
            "flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors",
            pathname.includes("/live") && "bg-gray-200",
          )}
        >
          <Video className="h-5 w-5" />
          <span>Live</span>
        </Link>
        <Link
          href="/collections"
          className={cn(
            "flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors",
            pathname.includes("/collections") && "bg-gray-200",
          )}
        >
          <Film className="h-5 w-5" />
          <span>Video Collections</span>
        </Link>
        <Link
          href="/video-processing"
          className={cn(
            "flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors",
            pathname.includes("/video-processing") && "bg-gray-200",
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Video Processing</span>
        </Link>
      </nav>
      <div className="absolute bottom-0 w-60 border-t p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 w-full text-left rounded-md hover:bg-gray-100 transition-colors"
        >
          <User className="h-5 w-5" />
          <span>Account</span>
        </button>
      </div>
    </div>
  )
}

