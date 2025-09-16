import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createApiHandler, AppError } from "@/lib/error-handler";

const itemSchema = z.object({
  descricao: z.string().min(1, "A descrição do item é obrigatória."),
  quantidade: z.number().min(1, "A quantidade deve ser pelo menos 1."),
  preco: z.number().min(0, "O preço não pode ser negativo."),
});

const createOrderSchema = z.object({
  clienteId: z.string().min(1, "O cliente é obrigatório."),
  tipoMaquina: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  acessorios: z.string().optional(),
  problemaDescricao: z.string().min(1, "A descrição do problema é obrigatória."),
  itensServico: z.array(itemSchema).min(1, "Deve haver pelo menos um item de serviço."),
  status: z.enum(["DRAFT", "BUDGET", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELED"]).default("DRAFT"),
});

export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser();
  if (!user || !user.company?.id) {
    throw new AppError("Não autorizado", 401);
  }

  const body = await request.json();
  const orderData = createOrderSchema.parse(body);

  const newOrder = await prisma.$transaction(async (tx) => {
    const latestOrder = await tx.serviceOrder.findFirst({
        where: { companyId: user.company!.id },
        orderBy: { internalId: 'desc' },
    });
    const nextInternalId = (latestOrder?.internalId || 0) + 1;

    const serviceOrder = await tx.serviceOrder.create({
      data: {
        internalId: nextInternalId,
        customerId: orderData.clienteId,
        companyId: user.company!.id,
        authorId: user.id,
        equipment: orderData.tipoMaquina,
        brand: orderData.marca,
        model: orderData.modelo,
        serialNumber: orderData.numeroSerie,
        accessories: orderData.acessorios,
        problemDescription: orderData.problemaDescricao,
        status: orderData.status,
        total: orderData.itensServico.reduce((acc, item) => acc + item.quantidade * item.preco, 0),
      },
    });

    await tx.serviceItem.createMany({
      data: orderData.itensServico.map((item) => ({
        description: item.descricao,
        quantity: item.quantidade,
        unitPrice: item.preco,
        serviceOrderId: serviceOrder.id,
      })),
    });
    
    return serviceOrder;
  });

  return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
}, "service-orders/create");
