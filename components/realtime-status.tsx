"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { useRealtimeContext } from "./realtime-provider"

export function RealtimeStatus() {
  const { isConnected } = useRealtimeContext()

  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1 text-xs">
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Offline
        </>
      )}
    </Badge>
  )
}
