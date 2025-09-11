import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { clientSchema } from "@/lib/validations"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clients)
}, "clients/GET")

export const POST = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = clientSchema.parse(body)

  const client = await prisma.client.create({
    data: {
      ...validatedData,
      companyId: user.companyId,
    },
  })

  return NextResponse.json(client, { status: 201 })
}, "clients/POST")
