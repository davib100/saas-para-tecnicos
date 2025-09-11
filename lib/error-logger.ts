export interface ErrorLog {
  id: string
  timestamp: Date
  level: "error" | "warning" | "info"
  message: string
  stack?: string
  component?: string
  script?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  metadata?: Record<string, any>
  resolved?: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface ErrorStats {
  totalErrors: number
  errorsByScript: Record<string, number>
  errorsByComponent: Record<string, number>
  errorsByLevel: Record<string, number>
  recentErrors: ErrorLog[]
  topErrors: Array<{ message: string; count: number; lastOccurred: Date }>
}

class ErrorLogger {
  private errors: ErrorLog[] = []
  private maxErrors = 1000
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeErrorCapture()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeErrorCapture() {
    // Capture unhandled errors
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        this.logError({
          message: event.message,
          stack: event.error?.stack,
          script: event.filename || "unknown",
          component: "window",
          metadata: {
            lineno: event.lineno,
            colno: event.colno,
            type: "javascript_error",
          },
        })
      })

      // Capture unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.logError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          component: "promise",
          metadata: {
            reason: event.reason,
            type: "promise_rejection",
          },
        })
      })

      // Capture console errors
      const originalConsoleError = console.error
      console.error = (...args) => {
        this.logError({
          message: args.join(" "),
          component: "console",
          level: "error",
          metadata: {
            args,
            type: "console_error",
          },
        })
        originalConsoleError.apply(console, args)
      }
    }
  }

  logError(params: {
    message: string
    stack?: string
    component?: string
    script?: string
    level?: "error" | "warning" | "info"
    metadata?: Record<string, any>
  }) {
    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      level: params.level || "error",
      message: params.message,
      stack: params.stack,
      component: params.component,
      script: params.script || this.detectScript(),
      sessionId: this.sessionId,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      metadata: params.metadata,
      resolved: false,
    }

    this.errors.unshift(errorLog)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    // Store in localStorage for persistence
    this.persistErrors()

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Error Logger - ${params.level?.toUpperCase()}`)
      console.error("Message:", params.message)
      console.error("Component:", params.component)
      console.error("Script:", params.script)
      console.error("Stack:", params.stack)
      console.error("Metadata:", params.metadata)
      console.groupEnd()
    }

    return errorLog.id
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private detectScript(): string {
    const stack = new Error().stack
    if (!stack) return "unknown"

    const lines = stack.split("\n")
    for (const line of lines) {
      if (line.includes(".tsx") || line.includes(".ts") || line.includes(".js")) {
        const match = line.match(/([^/\\]+\.(tsx?|jsx?))/)
        if (match) return match[1]
      }
    }
    return "unknown"
  }

  private persistErrors() {
    if (typeof window !== "undefined") {
      try {
        const recentErrors = this.errors.slice(0, 100) // Store only recent 100 errors
        localStorage.setItem("app_error_logs", JSON.stringify(recentErrors))
      } catch (error) {
        console.warn("Failed to persist error logs:", error)
      }
    }
  }

  private loadPersistedErrors() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("app_error_logs")
        if (stored) {
          const parsedErrors = JSON.parse(stored) as ErrorLog[]
          this.errors = parsedErrors.map((error) => ({
            ...error,
            timestamp: new Date(error.timestamp),
          }))
        }
      } catch (error) {
        console.warn("Failed to load persisted error logs:", error)
      }
    }
  }

  getErrors(): ErrorLog[] {
    return [...this.errors]
  }

  getErrorStats(): ErrorStats {
    const errorsByScript: Record<string, number> = {}
    const errorsByComponent: Record<string, number> = {}
    const errorsByLevel: Record<string, number> = {}
    const errorCounts: Record<string, { count: number; lastOccurred: Date }> = {}

    this.errors.forEach((error) => {
      // Count by script
      if (error.script) {
        errorsByScript[error.script] = (errorsByScript[error.script] || 0) + 1
      }

      // Count by component
      if (error.component) {
        errorsByComponent[error.component] = (errorsByComponent[error.component] || 0) + 1
      }

      // Count by level
      errorsByLevel[error.level] = (errorsByLevel[error.level] || 0) + 1

      // Count by message for top errors
      if (!errorCounts[error.message]) {
        errorCounts[error.message] = { count: 0, lastOccurred: error.timestamp }
      }
      errorCounts[error.message].count++
      if (error.timestamp > errorCounts[error.message].lastOccurred) {
        errorCounts[error.message].lastOccurred = error.timestamp
      }
    })

    const topErrors = Object.entries(errorCounts)
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalErrors: this.errors.length,
      errorsByScript,
      errorsByComponent,
      errorsByLevel,
      recentErrors: this.errors.slice(0, 20),
      topErrors,
    }
  }

  resolveError(errorId: string, resolvedBy?: string) {
    const error = this.errors.find((e) => e.id === errorId)
    if (error) {
      error.resolved = true
      error.resolvedAt = new Date()
      error.resolvedBy = resolvedBy
      this.persistErrors()
    }
  }

  clearErrors() {
    this.errors = []
    this.persistErrors()
  }

  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2)
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger()

// Utility functions for components
export function logComponentError(component: string, error: unknown, metadata?: Record<string, any>) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  return errorLogger.logError({
    message,
    stack,
    component,
    metadata: {
      ...metadata,
      errorType: error?.constructor?.name || "Unknown",
    },
  })
}

export function logScriptError(script: string, error: unknown, metadata?: Record<string, any>) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  return errorLogger.logError({
    message,
    stack,
    script,
    metadata: {
      ...metadata,
      errorType: error?.constructor?.name || "Unknown",
    },
  })
}

export function logApiError(endpoint: string, error: unknown, metadata?: Record<string, any>) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  return errorLogger.logError({
    message: `API Error: ${message}`,
    stack,
    component: "api",
    script: endpoint,
    metadata: {
      ...metadata,
      endpoint,
      errorType: error?.constructor?.name || "Unknown",
    },
  })
}

// React hook for error logging
export function useErrorLogger() {
  return {
    logError: (error: unknown, component?: string, metadata?: Record<string, any>) => {
      return logComponentError(component || "unknown", error, metadata)
    },
    getErrors: () => errorLogger.getErrors(),
    getStats: () => errorLogger.getErrorStats(),
    resolveError: (errorId: string) => errorLogger.resolveError(errorId),
    clearErrors: () => errorLogger.clearErrors(),
  }
}
