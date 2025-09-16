import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { productSchema } from "@/lib/validators"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    where: { companyId: user.company.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}, "products/GET")

export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = productSchema.parse(body)

  const product = await prisma.product.create({
    data: {
      ...validatedData,
      companyId: user.company.id,
    },
  })

  return NextResponse.json(product, { status: 201 })
}, "products/POST")
