"use client"

import * as React from "react"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  React.useEffect(() => {
    // Apply default theme class to document
    if (defaultTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", prefersDark)
    } else if (defaultTheme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }, [defaultTheme])

  return <>{children}</>
}
