import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"
import { createApiHandler } from "@/lib/error-handler"

const settingsSchema = z.object({
  companyName: z.string().min(1).max(100).optional(),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().max(20).optional(),
  companyAddress: z.string().max(500).optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  defaultWarrantyDays: z.number().min(0).max(3650).optional(),
  autoBackupEnabled: z.boolean().optional(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  notificationSettings: z
    .object({
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      orderUpdates: z.boolean().optional(),
      paymentReminders: z.boolean().optional(),
    })
    .optional(),
})

export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let settings = await prisma.companySettings.findUnique({
    where: { companyId: user.companyId },
    select: {
      id: true,
      companyName: true,
      companyEmail: true,
      companyPhone: true,
      companyAddress: true,
      defaultTaxRate: true,
      defaultWarrantyDays: true,
      autoBackupEnabled: true,
      backupFrequency: true,
      notificationSettings: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {
        companyId: user.companyId,
        autoBackupEnabled: true,
        backupFrequency: "daily",
        defaultTaxRate: 0,
        defaultWarrantyDays: 90,
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          orderUpdates: true,
          paymentReminders: true,
        },
      },
      select: {
        id: true,
        companyName: true,
        companyEmail: true,
        companyPhone: true,
        companyAddress: true,
        defaultTaxRate: true,
        defaultWarrantyDays: true,
        autoBackupEnabled: true,
        backupFrequency: true,
        notificationSettings: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  return NextResponse.json(settings)
}, "settings/GET")

export const PUT = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const validatedData = settingsSchema.parse(body)

  const settings = await prisma.companySettings.upsert({
    where: { companyId: user.companyId },
    update: {
      ...validatedData,
      updatedAt: new Date(),
    },
    create: {
      ...validatedData,
      companyId: user.companyId,
    },
    select: {
      id: true,
      companyName: true,
      companyEmail: true,
      companyPhone: true,
      companyAddress: true,
      defaultTaxRate: true,
      defaultWarrantyDays: true,
      autoBackupEnabled: true,
      backupFrequency: true,
      notificationSettings: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(settings)
}, "settings/PUT")
