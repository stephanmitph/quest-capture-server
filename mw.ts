import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "./lib/jwt"

// Define which paths are protected and which are public
const PUBLIC_PATHS = ["data", "/login", "/api/auth/login"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for public paths and static files
  if (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith("/public/") ||
    path.includes("/api/auth/login") ||
    path.includes("data")
  ) {
    return NextResponse.next()
  }

  // Check for auth token in cookies
  const token = request.cookies.get("auth_token")?.value

  // If no token is present, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  try {
    // Verify the token
    const payload = await verifyJWT(token)

    // If token is invalid, redirect to login
    if (!payload) {
      const url = new URL("/login", request.url)
      return NextResponse.redirect(url)
    }

    // Token is valid, proceed
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware auth error:", error)
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

