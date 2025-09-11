import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { serviceOrderSchema } from "@/lib/validations"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orders = await prisma.serviceOrder.findMany({
    where: { companyId: user.companyId },
    include: {
      client: true,
      technician: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}, "orders/GET")

export const POST = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = serviceOrderSchema.parse(body)

  // Generate order number
  const orderCount = await prisma.serviceOrder.count({
    where: { companyId: user.companyId },
  })
  const orderNumber = `OS${String(orderCount + 1).padStart(6, "0")}`

  const order = await prisma.serviceOrder.create({
    data: {
      ...validatedData,
      orderNumber,
      companyId: user.companyId,
      technicianId: user.id,
    },
    include: {
      client: true,
      technician: true,
    },
  })

  // Create activity log
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
