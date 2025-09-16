import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { ClientSchema as clientSchema } from "@/lib/validators"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    where: { companyId: user.company.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clients)
}, "clients/GET")

export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = clientSchema.parse(body)

  const client = await prisma.client.create({
    data: {
      ...validatedData,
      companyId: user.company.id,
    },
  })

  return NextResponse.json(client, { status: 201 })
}, "clients/POST")
