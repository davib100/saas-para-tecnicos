'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  componentName?: string
  maxRetries?: number
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  retryCount: number
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Report to error logging service
    this.reportError(error, errorInfo)
  }

  reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, you would send this to your error reporting service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      component: this.props.componentName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    console.error('Error Report:', errorData)
    
    // Example: Send to error reporting service
    // errorReportingService.report(errorData)
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    
    if (this.state.retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    })
  }

  handleHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const { maxRetries = 3, fallback, componentName } = this.props
      const canRetry = this.state.retryCount < maxRetries

      if (fallback) {
        return fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl shadow-modern-2xl animate-scale-in">
            <CardHeader className="text-center pb-6">
              <div className="size-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">
                Oops! Algo deu errado
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  Encontramos um erro inesperado {componentName && `no componente ${componentName}`}.
                  Nossa equipe foi notificada e está trabalhando para resolver isso.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-4 bg-muted rounded-xl text-left">
                    <summary className="cursor-pointer font-semibold text-sm mb-2">
                      Detalhes do erro (modo desenvolvimento)
                    </summary>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div>
                        <strong>Erro:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="mt-1 whitespace-pre-wrap break-all">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="size-4" />
                    Tentar novamente ({maxRetries - this.state.retryCount} tentativas restantes)
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="size-4" />
                  Resetar componente
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={this.handleHome}
                  className="flex items-center gap-2"
                >
                  <Home className="size-4" />
                  Voltar ao início
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Se o problema persistir, entre em contato com o suporte técnico.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}