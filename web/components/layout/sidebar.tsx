"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Video, User, Settings, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const { user, login, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar")
      const toggle = document.getElementById("sidebar-toggle")

      if (
        isOpen &&
        sidebar &&
        toggle &&
        !sidebar.contains(event.target as Node) &&
        !toggle.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        id="sidebar-toggle"
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className={cn(
          "fixed top-0 left-0 z-40 w-60 h-screen bg-gray-50 border-r transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Quest Capture Server</h1>
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
        </nav>
        <div className="absolute bottom-0 w-60 border-t p-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 p-3 w-full text-left rounded-md hover:bg-gray-100 transition-colors"
          >
            <User className="h-5 w-5" />
            <span>{isLoading ? "Loading..." : user?.username}</span>
          </button>
        </div>
      </div>
    </>
  )
}

