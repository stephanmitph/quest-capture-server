import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/jwt"

export async function GET() {
  try {
    // Get the token from cookies
    const token = (await cookies()).get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Verify the token
    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        username: payload.username,
        role: payload.role,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, message: "Authentication check failed" }, { status: 500 })
  }
}

