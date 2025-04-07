import { NextResponse } from "next/server"
import { signJWT } from "@/lib/jwt"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate credentials (hardcoded for simplicity)
    if (username !== "sipuser" || password !== "siplab") {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = await signJWT({
      username,
      // Add any additional user data here
      role: "admin",
    })

    // Set JWT as HTTP-only cookie
    await (await cookies()).set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({
      success: true,
      user: { username },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}

