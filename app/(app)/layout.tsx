import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { RealtimeProvider } from "@/components/realtime-provider"
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: {
    default: "TechOS - Sistema de Ordem de Serviço",
    template: "%s | TechOS",
  },
  description: "Sistema moderno e completo para gerenciamento de ordens de serviço, clientes e produtos com interface intuitiva",
  keywords: ["ordem de serviço", "OS", "gestão", "clientes", "produtos", "sistema"],
  authors: [{ name: "TechOS Team" }],
  creator: "TechOS",
  publisher: "TechOS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: 'TechOS - Sistema de Ordem de Serviço',
    description: 'Sistema moderno para gerenciamento de ordens de serviço',
    siteName: 'TechOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechOS - Sistema de Ordem de Serviço',
    description: 'Sistema moderno para gerenciamento de ordens de serviço',
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#8b5cf6" },
  ],
  colorScheme: "light dark",
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TechOS" />
        <meta name="application-name" content="TechOS" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="theme-color" content="#6366f1" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/geist-sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/geist-mono.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Favicon and icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      
      <body 
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <EnhancedErrorBoundary componentName="AppLayout" maxRetries={3}>
          <AuthProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="system" 
              enableSystem 
              disableTransitionOnChange={false}
            >
              <RealtimeProvider>
                {/* Skip to main content link for accessibility */}
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-modern-xl transition-all-smooth"
                >
                  Pular para o conteúdo principal
                </a>
                
                {/* Main application content */}
                <main role="main" id="main-content" className="min-h-screen">
                  {children}
                </main>
                
                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  expand={false}
                  richColors
                  closeButton
                  duration={4000}
                  toastOptions={{
                    className: "shadow-modern-xl border-0 glass-effect",
                    style: {
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--glass-border)',
                    },
                  }}
                />
                
                {/* Loading indicator for page transitions */}
                <div id="loading-indicator" className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 transition-opacity" />
                
                {/* Global keyboard shortcuts handler */}
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      document.addEventListener('keydown', function(e) {
                        // Ctrl/Cmd + K for search (future feature)
                        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                          e.preventDefault();
                          // Trigger search modal
                        }
                        
                        // Escape to close modals/dropdowns
                        if (e.key === 'Escape') {
                          // Handle escape key globally
                          const activeModal = document.querySelector('[data-state="open"]');
                          if (activeModal) {
                            activeModal.click();
                          }
                        }
                      });
                    `,
                  }}
                />
              </RealtimeProvider>
            </ThemeProvider>
          </AuthProvider>
        </EnhancedErrorBoundary>
        
        {/* Service Worker registration for PWA functionality */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}