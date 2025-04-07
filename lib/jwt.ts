import { SignJWT, jwtVerify } from "jose"

// Secret key for JWT signing and verification
// In production, use a proper secret management system
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-should-be-at-least-32-characters",
)

export async function signJWT(payload: any, expiresIn = "24h") {
  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET)

    return jwt
  } catch (error) {
    console.error("Error signing JWT:", error)
    throw error
  }
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

