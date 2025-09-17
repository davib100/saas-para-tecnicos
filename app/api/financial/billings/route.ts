'use client'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema de validação para os parâmetros da query
const searchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Validar e extrair parâmetros da URL
    const { searchParams } = new URL(req.url)
    const validation = searchParamsSchema.safeParse(Object.fromEntries(searchParams));

    if (!validation.success) {
      return NextResponse.json({ error: 'Parâmetros inválidos', details: validation.error.flatten() }, { status: 400 });
    }

    const { page, limit, search, status } = validation.data;

    const where: any = {};

    // Construir a cláusula 'where' para a busca
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { clienteNome: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Construir a cláusula 'where' para o filtro de status
    if (status && status !== 'all') {
        // Garantir que o status seja um dos valores permitidos no seu modelo Prisma
        // Ex: enum BillingStatus { Pendente, Pago, Vencido, Cancelado }
        // Esta é uma verificação simples, ajuste conforme o seu enum
        if (['Pendente', 'Pago', 'Vencido', 'Cancelado'].includes(status)) {
             where.status = status;
        }
    }

    // Calcular o offset para a paginação
    const offset = (page - 1) * limit;

    // Fazer as duas chamadas ao banco de dados em paralelo
    const [billings, total] = await prisma.$transaction([
      prisma.billing.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          dataCriacao: 'desc',
        },
      }),
      prisma.billing.count({ where }),
    ]);

    // Calcular o total de páginas
    const totalPages = Math.ceil(total / limit);

    // Retornar a resposta com os dados e metadados de paginação
    return NextResponse.json({
      data: billings,
      total,
      page,
      totalPages,
    });

  } catch (error) {
    console.error('[API BILLINGS - GET]', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
