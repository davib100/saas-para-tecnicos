"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface RealtimeEvent {
  type: string
  data: any
  timestamp: number
}

interface UseRealtimeOptions {
  endpoint?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

interface UseRealtimeReturn {
  isConnected: boolean
  lastEvent: RealtimeEvent | null
  connectionAttempts: number
  subscribe: (eventType: string, callback: (data: any) => void) => () => void
  emit: (eventType: string, data: any) => void
  connect: () => void
  disconnect: () => void
}

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const {
    endpoint = "/api/realtime",
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)

  const connect = useCallback(() => {
    if (isConnectingRef.current) {
      return
    }

    try {
      isConnectingRef.current = true
      console.log("[v0] Establishing realtime connection...")

      // Simulate successful connection after a brief delay
      setTimeout(() => {
        setIsConnected(true)
        setConnectionAttempts(0)
        isConnectingRef.current = false
        onConnect?.()
        console.log("[v0] Realtime connection established")
      }, 500)
    } catch (error) {
      console.error("[v0] Error creating connection:", error)
      isConnectingRef.current = false
      onError?.(error as Event)

      // Retry connection if under max attempts
      if (connectionAttempts < maxReconnectAttempts) {
        setConnectionAttempts((prev) => prev + 1)
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }
    }
  }, [onConnect, onError, connectionAttempts, maxReconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    isConnectingRef.current = false
    setIsConnected(false)
    setConnectionAttempts(0)
    console.log("[v0] Realtime connection closed")
  }, [])

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set())
    }

    subscribersRef.current.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(eventType)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          subscribersRef.current.delete(eventType)
        }
      }
    }
  }, [])

  const emit = useCallback(
    (eventType: string, data: any) => {
      if (isConnected) {
        const event: RealtimeEvent = {
          type: eventType,
          data,
          timestamp: Date.now(),
        }

        // Trigger subscribers immediately for local updates
        const subscribers = subscribersRef.current.get(eventType)
        if (subscribers) {
          subscribers.forEach((callback) => {
            try {
              callback(data)
            } catch (error) {
              console.error("[v0] Error in subscriber callback:", error)
            }
          })
        }

        setLastEvent(event)
        console.log("[v0] Event emitted:", event.type)
      } else {
        console.warn("[v0] Cannot emit event: Connection not established")
      }
    },
    [isConnected],
  )

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    lastEvent,
    connectionAttempts,
    subscribe,
    emit,
    connect,
    disconnect,
  }
}
