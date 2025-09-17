import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { exportToExcel, type BackupData } from "@/lib/backup"
import { prisma } from "@/lib/prisma"
import { format, isValid, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { z } from "zod"
import { createApiHandler } from "@/lib/error-handler"

const exportParamsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  tables: z.string().optional(),
})

const allowedTables = [
  "orders",
  "clients",
  "products",
  "activities",
  "invoices",
] as const
type AllowedTable = (typeof allowedTables)[number]

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser()
  if (!user || !user.company?.id) {
    return NextResponse.json(
      { error: "Unauthorized or no company associated" },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const params = exportParamsSchema.parse({
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    tables: searchParams.get("tables"),
  })

  let from = new Date()
  let to = new Date()

  if (params.from) {
    const parsedFrom = new Date(params.from)
    if (!isValid(parsedFrom)) {
      return NextResponse.json(
        { error: "Invalid 'from' date format" },
        { status: 400 }
      )
    }
    from = parsedFrom
  }

  if (params.to) {
    const parsedTo = new Date(params.to)
    if (!isValid(parsedTo)) {
      return NextResponse.json(
        { error: "Invalid 'to' date format" },
        { status: 400 }
      )
    }
    to = parsedTo
  }

  const daysDifference = differenceInDays(to, from)
  if (daysDifference > 365) {
    return NextResponse.json(
      { error: "Export range cannot exceed 365 days" },
      { status: 400 }
    )
  }

  if (from > to) {
    return NextResponse.json(
      { error: "'from' date cannot be after 'to' date" },
      { status: 400 }
    )
  }

  const requestedTables = params.tables
    ? params.tables.split(",")
    : allowedTables
  const tables = requestedTables.filter((table): table is AllowedTable =>
    allowedTables.includes(table as AllowedTable)
  )

  if (tables.length === 0) {
    return NextResponse.json({ error: "No valid tables specified" }, { status: 400 })
  }

  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)

  console.log(
    "[v0] Exporting period data from:",
    format(from, "dd/MM/yyyy", { locale: ptBR }),
    "to:",
    format(to, "dd/MM/yyyy", { locale: ptBR }),
    "tables:",
    tables
  )

  const data: BackupData = {
    clients: [],
    products: [],
    orders: [],
    activities: [],
    invoices: [],
  }

  try {
    if (tables.includes("clients")) {
      data.clients = await prisma.client.findMany({
        where: {
          companyId: user.company.id,
          createdAt: { gte: from, lte: to },
        },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 10000, // Limit results
      })
    }

    if (tables.includes("products")) {
      data.products = await prisma.product.findMany({
        where: {
          companyId: user.company.id,
          OR: [
            { createdAt: { gte: from, lte: to } },
            { updatedAt: { gte: from, lte: to } },
          ],
        },
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          price: true,
          stock: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 10000,
      })
    }

    if (tables.includes("orders")) {
      data.orders = await prisma.serviceOrder.findMany({
        where: {
          companyId: user.company.id,
          OR: [
            { createdAt: { gte: from, lte: to } },
            { updatedAt: { gte: from, lte: to } },
          ],
        },
        include: {
          client: { select: { nome: true, email: true, telefone: true } },
          technician: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true, brand: true, model: true } },
            },
          },
        },
        take: 5000,
      })
    }

    if (tables.includes("activities")) {
      data.activities = await prisma.activity.findMany({
        where: {
          order: { companyId: user.company.id },
          createdAt: { gte: from, lte: to },
        },
        include: {
          user: { select: { name: true, email: true } },
          order: { select: { orderNumber: true } },
        },
        take: 10000,
      })
    }

    if (tables.includes("invoices")) {
      data.invoices = await prisma.invoice.findMany({
        where: {
          companyId: user.company.id,
          OR: [
            { createdAt: { gte: from, lte: to } },
            { updatedAt: { gte: from, lte: to } },
          ],
        },
        include: {
          order: {
            select: { orderNumber: true, client: { select: { nome: true } } },
          },
        },
        take: 5000,
      })
    }

    allowedTables.forEach((table) => {
      if (!data[table]) {
        data[table] = []
      }
    })

    const buffer = await exportToExcel(data)
    const fileName = `periodo_${format(from, "yyyy-MM-dd")}_${format(
      to,
      "yyyy-MM-dd"
    )}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (dbError) {
    console.error("[v0] Database error during export:", dbError)
    return NextResponse.json(
      { error: "Database error occurred during export" },
      { status: 500 }
    )
  }
}, "export/period/GET")
