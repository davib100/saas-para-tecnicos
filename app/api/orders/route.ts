import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { serviceOrderSchema } from "@/lib/validators"
import { createApiHandler } from "@/lib/error-handler"

// Função GET com Paginação e Busca
export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const skip = (page - 1) * limit

  const whereClause = {
    companyId: user.company.id,
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { equipment: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [orders, total] = await prisma.$transaction([
    prisma.serviceOrder.findMany({
      where: whereClause,
      include: {
        client: true,
        technician: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.serviceOrder.count({ where: whereClause }),
  ])

  return NextResponse.json({
    data: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}, "orders/GET_PAGINATED_SEARCH")

// Função POST permanece a mesma
export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = serviceOrderSchema.parse(body)

  const orderCount = await prisma.serviceOrder.count({
    where: { companyId: user.company.id },
  })
  const orderNumber = `OS${String(orderCount + 1).padStart(6, "0")}`

  const order = await prisma.serviceOrder.create({
    data: {
      ...validatedData,
      orderNumber,
      companyId: user.company.id,
      technicianId: user.id,
    },
    include: {
      client: true,
      technician: true,
    },
  })

  await prisma.activity.create({
    data: {
      type: "order_created",
      description: "Ordem de serviço criada",
      orderId: order.id,
      userId: user.id,
    },
  })

  return NextResponse.json(order, { status: 201 })
}, "orders/POST")
