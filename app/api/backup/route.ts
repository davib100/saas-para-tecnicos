import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { saveDailyBackup } from "@/lib/backup"
import { prisma } from "@/lib/prisma"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "20")))
  const skip = (page - 1) * limit

  const [backups, total] = await Promise.all([
    prisma.backup.findMany({
      where: { companyId: user.company.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        fileSize: true,
        fileName: true,
      },
    }),
    prisma.backup.count({
      where: { companyId: user.company.id },
    }),
  ])

  const serializedBackups = backups.map(backup => ({
    ...backup,
    fileSize: backup.fileSize ? Number(backup.fileSize) : 0,
  }))

  return NextResponse.json({
    backups: serializedBackups,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}, "backup/GET")

export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const recentBackup = await prisma.backup.findFirst({
    where: {
      companyId: user.company.id,
      type: "DAILY",
      status: "COMPLETED",
      createdAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
    },
  })

  if (recentBackup) {
    return NextResponse.json({ error: "Backup já foi criado recentemente. Aguarde 5 minutos." }, { status: 429 })
  }

  const backupId = await saveDailyBackup(user.company.id)
  const backup = await prisma.backup.findUnique({
    where: { id: backupId },
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      fileSize: true,
      fileName: true,
    },
  })

  if (!backup) {
    return NextResponse.json({ error: "Falha ao criar o backup." }, { status: 500 })
  }

  const serializedBackup = {
    ...backup,
    fileSize: backup.fileSize ? Number(backup.fileSize) : 0,
  }

  return NextResponse.json(serializedBackup, { status: 201 })
}, "backup/POST")
