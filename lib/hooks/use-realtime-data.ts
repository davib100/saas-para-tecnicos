"use client"

import { useState, useEffect, useCallback } from "react"
import { useRealtimeContext } from "@/components/realtime-provider"

interface UseRealtimeDataOptions<T> {
  eventType: string
  initialData?: T[]
  onUpdate?: (data: T) => void
  onDelete?: (id: string) => void
}

interface UseRealtimeDataReturn<T> {
  data: T[]
  setData: (data: T[]) => void
  updateItem: (item: T) => void
  removeItem: (id: string) => void
  addItem: (item: T) => void
}

export function useRealtimeData<T extends { id: string }>({
  eventType,
  initialData = [],
  onUpdate,
  onDelete,
}: UseRealtimeDataOptions<T>): UseRealtimeDataReturn<T> {
  const [data, setData] = useState<T[]>(initialData)
  const { subscribe } = useRealtimeContext()

  const updateItem = useCallback(
    (updatedItem: T) => {
      setData((prevData) => {
        const existingIndex = prevData.findIndex((item) => item.id === updatedItem.id)
        if (existingIndex >= 0) {
          const newData = [...prevData]
          newData[existingIndex] = updatedItem
          return newData
        } else {
          return [...prevData, updatedItem]
        }
      })
      onUpdate?.(updatedItem)
    },
    [onUpdate],
  )

  const removeItem = useCallback(
    (id: string) => {
      setData((prevData) => prevData.filter((item) => item.id !== id))
      onDelete?.(id)
    },
    [onDelete],
  )

  const addItem = useCallback((newItem: T) => {
    setData((prevData) => {
      const exists = prevData.some((item) => item.id === newItem.id)
      if (!exists) {
        return [...prevData, newItem]
      }
      return prevData
    })
  }, [])

  useEffect(() => {
    const unsubscribeUpdate = subscribe(`${eventType}:update`, updateItem)
    const unsubscribeDelete = subscribe(`${eventType}:delete`, (data: { id: string }) => {
      removeItem(data.id)
    })
    const unsubscribeCreate = subscribe(`${eventType}:create`, addItem)

    return () => {
      unsubscribeUpdate()
      unsubscribeDelete()
      unsubscribeCreate()
    }
  }, [eventType, subscribe, updateItem, removeItem, addItem])

  return {
    data,
    setData,
    updateItem,
    removeItem,
    addItem,
  }
}
