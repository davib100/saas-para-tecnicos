import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { RealtimeProvider } from "@/components/realtime-provider"
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary"

export const metadata: Metadata = {
  title: {
    default: "Sistema de Ordem de Serviço",
    template: "%s | Sistema OS",
  },
  description: "Sistema completo para gerenciamento de ordens de serviço, clientes e produtos",
  generator: "v0.app",
  keywords: ["ordem de serviço", "gestão", "clientes", "produtos", "sistema"],
  authors: [{ name: "Sistema OS" }],
  creator: "v0.app",
  publisher: "Sistema OS",
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#10b981" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <EnhancedErrorBoundary componentName="RootLayout" maxRetries={1}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <RealtimeProvider>
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
            </RealtimeProvider>
          </ThemeProvider>
        </EnhancedErrorBoundary>
      </body>
    </html>
  )
}
