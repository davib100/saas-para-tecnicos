"use client"

import { useState, useEffect, useCallback } from "react"
import { logComponentError } from "@/lib/error-logger"

interface UseApiOptions {
  immediate?: boolean
  componentName?: string
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: () => Promise<void>
  reset: () => void
}

export function useApi<T>(apiFunction: () => Promise<T>, options: UseApiOptions = {}): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)

      logComponentError(options.componentName || "useApi", err, {
        apiFunction: apiFunction.name || "anonymous",
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      })
    } finally {
      setLoading(false)
    }
  }, [apiFunction, options.componentName])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  return { data, loading, error, execute, reset }
}
