import type { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"
import { createApiHandler } from "@/lib/error-handler"

const realtimeEventSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["order_update", "client_update", "product_update", "system_notification"]),
  data: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
})

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(
    JSON.stringify({
      status: "connected",
      timestamp: Date.now(),
      message: "Realtime polling endpoint active",
      companyId: user.companyId,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.NODE_ENV === "development" ? "*" : "https://yourdomain.com",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  )
}, "realtime/GET")

export const POST = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const body = await request.json()
  const validatedEvent = realtimeEventSchema.parse(body)

  const eventId = validatedEvent.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  console.log("[v0] Received realtime event:", {
    ...validatedEvent,
    id: eventId,
    companyId: user.companyId,
  })

  return new Response(
    JSON.stringify({
      status: "received",
      timestamp: Date.now(),
      eventId,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}, "realtime/POST")

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.NODE_ENV === "development" ? "*" : "https://yourdomain.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export function broadcastRealtimeEvent(eventType: string, data: any, companyId: string) {
  const message = {
    type: eventType,
    data,
    timestamp: Date.now(),
    companyId,
  }

  console.log("[v0] Broadcasting realtime event:", message)

  // In a real implementation, this would broadcast to connected clients
  // For now, we just log the event
  return message
}
