"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface RealtimeContextType {
  isConnected: boolean
  subscribe: (eventType: string, callback: (data: any) => void) => () => void
  emit: (eventType: string, data: any) => void
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

interface RealtimeProviderProps {
  children: React.ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected] = useState(true)

  const subscribe = (eventType: string, callback: (data: any) => void) => {
    console.log(`[v0] Subscribed to ${eventType}`)
    // Return unsubscribe function
    return () => {
      console.log(`[v0] Unsubscribed from ${eventType}`)
    }
  }

  const emit = (eventType: string, data: any) => {
    console.log(`[v0] Event emitted: ${eventType}`, data)
  }

  const contextValue: RealtimeContextType = {
    isConnected,
    subscribe,
    emit,
  }

  return <RealtimeContext.Provider value={contextValue}>{children}</RealtimeContext.Provider>
}

export function useRealtimeContext(): RealtimeContextType {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error("useRealtimeContext must be used within a RealtimeProvider")
  }
  return context
}
