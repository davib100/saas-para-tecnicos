import type React from "react"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { RealtimeProvider } from "@/components/realtime-provider"
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary"
import { ProtectedRoute } from "@/components/auth/protected-route"

// Este é o layout para a parte autenticada da aplicação.
// Ele não contém as tags <html> ou <body>, pois elas são gerenciadas pelo layout raiz.
// Ele envolve as páginas do aplicativo principal com os provedores e a rota protegida.
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <EnhancedErrorBoundary componentName="AppLayout" maxRetries={1}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <RealtimeProvider>
          <ProtectedRoute>
            <main role="main" id="main-content">
              {children}
            </main>
            <Toaster
              position="top-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                className: "toast-custom",
              }}
            />
          </ProtectedRoute>
        </RealtimeProvider>
      </ThemeProvider>
    </EnhancedErrorBoundary>
  )
}
