import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createApiHandler } from "@/lib/error-handler"

export const DELETE = createApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = await prisma.client.delete({
    where: {
      id: params.id,
      companyId: user.company.id,
    },
  })

  return NextResponse.json(client, { status: 200 })
}, "clients/DELETE")
