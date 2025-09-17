import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const companyId = user.company.id

  const [clients, products, orders] = await Promise.all([
    prisma.client.count({ where: { companyId } }),
    prisma.product.count({ where: { companyId } }),
    prisma.serviceOrder.count({ where: { companyId } }),
  ])

  return NextResponse.json({ clients, products, orders })
}, "stats/GET")
