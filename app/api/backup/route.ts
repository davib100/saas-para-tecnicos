import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { saveDailyBackup } from "@/lib/backup"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createApiHandler } from "@/lib/error-handler"

const backupRequestSchema = z.object({
  type: z.enum(["manual", "automatic"]),
})

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "20")))
  const skip = (page - 1) * limit

  const [backups, total] = await Promise.all([
    prisma.backup.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        size: true,
      },
    }),
    prisma.backup.count({
      where: { companyId: user.companyId },
    }),
  ])

  return NextResponse.json({
    backups,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}, "backup/GET")

export const POST = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const validatedData = backupRequestSchema.parse(body)

  const recentBackup = await prisma.backup.findFirst({
    where: {
      companyId: user.companyId,
      type: validatedData.type,
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
    },
  })

  if (recentBackup) {
    return NextResponse.json({ error: "Backup already created recently. Please wait 5 minutes." }, { status: 429 })
  }

  if (validatedData.type === "manual") {
    const backupId = await saveDailyBackup(user.companyId)
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        size: true,
      },
    })

    return NextResponse.json(backup, { status: 201 })
  }

  return NextResponse.json({ error: "Invalid backup type" }, { status: 400 })
}, "backup/POST")
