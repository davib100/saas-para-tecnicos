'use client'

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user" | "technician"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (status === 'authenticated') {
    // Se uma role é necessária, verificamos se o usuário tem essa role.
    // Assumimos que a role está em `session.user.role`.
    // Ajuste `session.user.role` conforme a estrutura do seu objeto de sessão.
    // @ts-ignore
    const userRole = session.user?.role

    if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
      // Opcional: redirecionar para uma página de acesso negado
      // router.push('/unauthorized')
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      )
    }

    // Se autenticado e com a role correta (ou nenhuma role necessária), renderiza o conteúdo.
    return <>{children}</>
  }

  // Se não estiver carregando e não estiver autenticado, não renderiza nada
  // pois o useEffect já está cuidando do redirecionamento.
  return null
}
