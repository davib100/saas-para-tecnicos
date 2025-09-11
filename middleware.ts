import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Add user info to headers for API routes
  const response = NextResponse.next()
  response.headers.set("x-user-id", decoded.userId)
  response.headers.set("x-company-id", decoded.companyId)

  return response
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
}
