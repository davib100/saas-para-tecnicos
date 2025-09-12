import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password", // Permitir acesso à página para solicitar redefinição
    "/reset-password",  // Permitir acesso à página para criar nova senha
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password" // Permitir acesso à API para solicitar redefinição
  ]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      // Se a verificação falhar (token inválido mas não expirado, etc)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    if (decoded.userId && decoded.companyId) {
        response.headers.set("x-user-id", decoded.userId)
        response.headers.set("x-company-id", decoded.companyId)
    }

    return response
  } catch (error) {
    // Se o token estiver expirado ou malformado, verifyToken pode lançar um erro
    console.error("Middleware token verification error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
}
