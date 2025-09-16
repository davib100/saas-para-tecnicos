import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async () => {
  const user = await getAuthUser()
  if (!user || !user.company?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [osAndamento, osConcluidas, orcamentosPendentes, receitaBruta] = await prisma.$transaction([
    // OS em Andamento
    prisma.serviceOrder.count({
      where: {
        companyId: user.company.id,
        status: { in: ["Em Execução", "Aguardando Aprovação", "Orçamento Gerado", "Rascunho"] },
      },
    }),
    // OS Concluídas no mês atual
    prisma.serviceOrder.count({
      where: {
        companyId: user.company.id,
        status: "Concluído",
        updatedAt: { gte: startOfMonth },
      },
    }),
    // Orçamentos Pendentes
    prisma.serviceOrder.count({
      where: {
        companyId: user.company.id,
        status: "Aguardando Aprovação",
      },
    }),
    // Receita Mensal (soma dos valores das OS concluídas no mês)
    prisma.serviceOrder.aggregate({
      _sum: {
        estimatedValue: true,
      },
      where: {
        companyId: user.company.id,
        status: "Concluído",
        updatedAt: { gte: startOfMonth },
      },
    }),
  ])

  const stats = {
    osAndamento: osAndamento || 0,
    osConcluidas: osConcluidas || 0,
    orcamentosPendentes: orcamentosPendentes || 0,
    receitaMensal: receitaBruta._sum.estimatedValue || 0,
  }

  return NextResponse.json(stats)
}, "dashboard/stats/GET_FIXED")
