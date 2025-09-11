import { type NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/lib/validations"
import { verifyPassword, generateToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ message: "Account is deactivated" }, { status: 401 })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Generate JWT token
    const token = generateToken(user.id, user.companyId)

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
