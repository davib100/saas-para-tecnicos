import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createApiHandler, AppError } from "@/lib/error-handler"

// Esquema de validação para ATUALIZAÇÃO
const updateProductSchema = z.object({
  tipo: z.enum(["estoque", "maquina"]).optional(),
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  sku: z.string().optional().nullable(),
  preco: z.coerce.number().optional().nullable(),
  quantidade: z.coerce.number().optional().nullable(),
  marca: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  numeroSerie: z.string().optional().nullable(),
  estadoEntrada: z.string().optional().nullable(),
  acessorios: z.string().optional().nullable(),
  senha: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});


// PUT: Atualizar um produto existente
export const PUT = createApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getAuthUser();
  if (!user || !user.company?.id) {
    throw new AppError("Não autorizado", 401);
  }

  const body = await request.json();
  const productData = updateProductSchema.parse(body);

  const updatedProduct = await prisma.product.update({
    where: {
      id: params.id,
      companyId: user.company.id,
    },
    data: productData,
  });

  return NextResponse.json(updatedProduct, { status: 200 });
}, "products/update");


// DELETE: Deletar um produto
export const DELETE = createApiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const user = await getAuthUser()
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.product.delete({
    where: {
      id: params.id,
      companyId: user.company.id,
    },
  })

  return new Response(null, { status: 204 })
}, "products/delete")
