import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { serviceOrderSchema } from "@/lib/validators"
import { createApiHandler } from "@/lib/error-handler"

export const PUT = createApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
    const user = await getAuthUser()
    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = serviceOrderSchema.partial().parse(body) // Partial validation for updates

    const updatedOrder = await prisma.serviceOrder.update({
        where: {
            id: params.id,
            companyId: user.company.id,
        },
        data: validatedData,
        include: {
            client: true,
            technician: true,
        },
    })

    await prisma.activity.create({
        data: {
          type: "order_updated",
          description: "Ordem de serviço atualizada",
          orderId: updatedOrder.id,
          userId: user.id,
        },
      })

    return NextResponse.json(updatedOrder)
}, "orders/PUT")

export const DELETE = createApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
    const user = await getAuthUser()
    if (!user || !user.company) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.serviceOrder.delete({
        where: {
            id: params.id,
            companyId: user.company.id,
        },
    })

    // You might want to create an activity log for deletion as well
    await prisma.activity.create({
      data: {
        type: "order_deleted",
        description: `Ordem de serviço ID ${params.id} deletada`,
        orderId: params.id, // The ID of the deleted order
        userId: user.id,
      },
    })


    return new Response(null, { status: 204 })
}, "orders/DELETE")

