
import type React from "react"

// Este layout envolve as páginas de autenticação (login, registro, etc.).
// Ele não precisa de nenhuma estrutura HTML adicional (<html>, <body>),
// pois isso já é fornecido pelo layout raiz (app/layout.tsx).
// Ele simplesmente renderiza as páginas filhas que recebe.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
