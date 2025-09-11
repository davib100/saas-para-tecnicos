import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
