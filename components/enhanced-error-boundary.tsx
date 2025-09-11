"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertTriangle, RefreshCw, Home, ChevronDown, Bug, Copy } from "lucide-react"
import { logComponentError } from "@/lib/error-logger"
import { toast } from "sonner"

interface EnhancedErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
  retryCount: number
  showDetails: boolean
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void; errorId?: string }>
  componentName?: string
  maxRetries?: number
}

export class EnhancedErrorBoundary extends React.Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Enhanced Error Boundary caught error:", error, errorInfo)

    // Log error with detailed information
    const errorId = logComponentError(this.props.componentName || "ErrorBoundary", error, {
      errorInfo: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      props: this.props,
    })

    this.setState({
      error,
      errorInfo,
      errorId,
      hasError: true,
    })
  }

  handleReset = () => {
    const maxRetries = this.props.maxRetries || 3

    if (this.state.retryCount >= maxRetries) {
      toast.error(`Máximo de ${maxRetries} tentativas atingido. Recarregue a página.`)
      return
    }

    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      retryCount: prevState.retryCount + 1,
      showDetails: false,
    }))

    // Auto-retry with exponential backoff
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }

    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000)
    this.retryTimeout = setTimeout(() => {
      // Force re-render
      this.forceUpdate()
    }, delay)
  }

  handleCopyError = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
    toast.success("Detalhes do erro copiados para a área de transferência")
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} reset={this.handleReset} errorId={this.state.errorId} />
      }

      const maxRetries = this.props.maxRetries || 3
      const canRetry = this.state.retryCount < maxRetries

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl">Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado no componente {this.props.componentName || "desconhecido"}.
                {this.state.errorId && (
                  <Badge variant="outline" className="ml-2">
                    ID: {this.state.errorId.slice(-8)}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.retryCount > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Tentativa {this.state.retryCount} de {maxRetries}
                  </p>
                </div>
              )}

              <Collapsible open={this.state.showDetails} onOpenChange={(open) => this.setState({ showDetails: open })}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent">
                    <span className="flex items-center">
                      <Bug className="w-4 h-4 mr-2" />
                      Detalhes técnicos
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Mensagem do erro:</p>
                      <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
                        {this.state.error?.message}
                      </p>
                    </div>

                    {this.state.error?.stack && (
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Stack trace:</p>
                        <pre className="text-xs text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-x-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.handleCopyError}
                      className="w-full bg-transparent"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar detalhes do erro
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-2">
                {canRetry ? (
                  <Button onClick={this.handleReset} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente ({maxRetries - this.state.retryCount} restantes)
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar Página
                  </Button>
                )}

                <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-muted-foreground text-center">
                  Modo de desenvolvimento - Detalhes completos disponíveis no console
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar o error boundary programaticamente
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
