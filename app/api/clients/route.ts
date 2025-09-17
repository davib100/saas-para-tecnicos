import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { ClientSchema as clientSchema } from "@/lib/validators"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10)
  const searchTerm = searchParams.get("search") || ""

  const whereCondition = {
    companyId: user.company.id,
    ...(searchTerm && {
      OR: [
        { nome: { contains: searchTerm, mode: "insensitive" } },
        { documento: { contains: searchTerm, mode: "insensitive" } },
      ],
    }),
  }

  const clients = await prisma.client.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const totalClients = await prisma.client.count({
    where: whereCondition,
  })

  return NextResponse.json({
    clients,
    totalPages: Math.ceil(totalClients / pageSize),
    totalClients,
  })
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
