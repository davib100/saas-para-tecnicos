
import type { Metadata, Viewport } from "next"
import nextFontLocal from "next/font/local"
import "./globals.css"
import { AuthSessionProvider } from "@/components/auth-session-provider"

const geistSans = nextFontLocal({
  src: "../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
})

const geistMono = nextFontLocal({
  src: "../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Sistema de Ordem de Serviço",
    template: "%s | Sistema OS",
  },
  description: "Sistema completo para gerenciamento de ordens de serviço, clientes e produtos",
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

// Este é o layout raiz e DEVE conter as tags <html> e <body>.
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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
