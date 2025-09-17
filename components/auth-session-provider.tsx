'use client'

import type React from 'react'
import { SessionProvider } from 'next-auth/react'

// O SessionProvider do NextAuth precisa ser um Client Component.
// Este componente wrapper permite que o usemos em nosso Server Component (o layout raiz).
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
