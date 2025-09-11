import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, companyId: string): string {
  return jwt.sign({ userId, companyId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string; companyId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; companyId: string }
  } catch {
    return null
  }
}

export async function getAuthUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { company: true },
  })

  return user
}
