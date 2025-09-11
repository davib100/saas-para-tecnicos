import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { productSchema } from "@/lib/validations"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}, "products/GET")

export const POST = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = productSchema.parse(body)

  const product = await prisma.product.create({
    data: {
      ...validatedData,
      companyId: user.companyId,
    },
  })

  return NextResponse.json(product, { status: 201 })
}, "products/POST")
