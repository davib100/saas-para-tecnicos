import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createApiHandler, AppError } from "@/lib/error-handler";

const searchSchema = z.object({
  query: z.string().min(1, "A busca não pode estar vazia."),
});

export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser();
  if (!user || !user.company?.id) {
    throw new AppError("Não autorizado", 401);
  }

  const body = await request.json();
  const { query } = searchSchema.parse(body);

  const customers = await prisma.customer.findMany({
    where: {
      companyId: user.company.id,
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          document: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      document: true, // Incluído para exibição (ex: "Nome - Documento")
    },
    take: 10, // Limita o número de resultados para performance
  });

  return NextResponse.json({ success: true, data: customers }, { status: 200 });
}, "customers/search");
