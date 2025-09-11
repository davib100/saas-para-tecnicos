import { prisma } from "./prisma"
import * as XLSX from "xlsx"
import cron from "node-cron"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export interface BackupData {
  clients: any[]
  products: any[]
  orders: any[]
  activities: any[]
  invoices: any[]
}

export async function createBackup(companyId: string): Promise<BackupData> {
  console.log("[v0] Creating backup for company:", companyId)

  const [clients, products, orders, activities, invoices] = await Promise.all([
    prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceOrder.findMany({
      where: { companyId },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        technician: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, brand: true, model: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activity.findMany({
      where: { order: { companyId } },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { companyId },
      include: {
        order: { select: { orderNumber: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return { clients, products, orders, activities, invoices }
}

export async function exportToExcel(data: BackupData, fileName?: string): Promise<Buffer> {
  console.log("[v0] Exporting data to Excel format")

  const workbook = XLSX.utils.book_new()

  // Clientes
  const clientsWS = XLSX.utils.json_to_sheet(
    data.clients.map((client) => ({
      ID: client.id,
      Nome: client.name,
      Email: client.email || "",
      Telefone: client.phone || "",
      CPF: client.cpf || "",
      CNPJ: client.cnpj || "",
      Endereço: client.address || "",
      Cidade: client.city || "",
      Estado: client.state || "",
      CEP: client.zipCode || "",
      Ativo: client.isActive ? "Sim" : "Não",
      "Data Criação": format(new Date(client.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    })),
  )
  XLSX.utils.book_append_sheet(workbook, clientsWS, "Clientes")

  // Produtos
  const productsWS = XLSX.utils.json_to_sheet(
    data.products.map((product) => ({
      ID: product.id,
      Nome: product.name,
      Marca: product.brand || "",
      Modelo: product.model || "",
      Categoria: product.category || "",
      Descrição: product.description || "",
      Preço: product.price ? `R$ ${product.price}` : "",
      Custo: product.cost ? `R$ ${product.cost}` : "",
      Estoque: product.stock,
      "Estoque Mínimo": product.minStock,
      "Código Barras": product.barcode || "",
      Ativo: product.isActive ? "Sim" : "Não",
      "Data Criação": format(new Date(product.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    })),
  )
  XLSX.utils.book_append_sheet(workbook, productsWS, "Produtos")

  // Ordens de Serviço
  const ordersWS = XLSX.utils.json_to_sheet(
    data.orders.map((order) => ({
      "Número OS": order.orderNumber,
      Cliente: order.client.name,
      Equipamento: order.equipment,
      Marca: order.brand || "",
      Modelo: order.model || "",
      "Número Série": order.serialNumber || "",
      Problema: order.problem,
      Diagnóstico: order.diagnosis || "",
      Solução: order.solution || "",
      Status: order.status,
      Prioridade: order.priority,
      "Valor Estimado": order.estimatedValue ? `R$ ${order.estimatedValue}` : "",
      "Valor Final": order.finalValue ? `R$ ${order.finalValue}` : "",
      "Custo Mão de Obra": order.laborCost ? `R$ ${order.laborCost}` : "",
      "Custo Peças": order.partsCost ? `R$ ${order.partsCost}` : "",
      "Data Estimada": order.estimatedDate ? format(new Date(order.estimatedDate), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Data Conclusão": order.completedDate
        ? format(new Date(order.completedDate), "dd/MM/yyyy", { locale: ptBR })
        : "",
      "Dias Garantia": order.warrantyDays || "",
      Técnico: order.technician?.name || "",
      Observações: order.observations || "",
      "Data Criação": format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    })),
  )
  XLSX.utils.book_append_sheet(workbook, ordersWS, "Ordens de Serviço")

  // Atividades
  const activitiesWS = XLSX.utils.json_to_sheet(
    data.activities.map((activity) => ({
      "Número OS": activity.order.orderNumber,
      Tipo: activity.type,
      Descrição: activity.description,
      Usuário: activity.user.name,
      "Data/Hora": format(new Date(activity.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    })),
  )
  XLSX.utils.book_append_sheet(workbook, activitiesWS, "Atividades")

  // Faturas
  const invoicesWS = XLSX.utils.json_to_sheet(
    data.invoices.map((invoice) => ({
      "Número Fatura": invoice.number,
      "Número OS": invoice.order.orderNumber,
      Cliente: invoice.order.client.name,
      Status: invoice.status,
      Valor: `R$ ${invoice.amount}`,
      "Data Vencimento": format(new Date(invoice.dueDate), "dd/MM/yyyy", { locale: ptBR }),
      "Data Pagamento": invoice.paidDate ? format(new Date(invoice.paidDate), "dd/MM/yyyy", { locale: ptBR }) : "",
      "Método Pagamento": invoice.paymentMethod || "",
      Observações: invoice.notes || "",
      "Data Criação": format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    })),
  )
  XLSX.utils.book_append_sheet(workbook, invoicesWS, "Faturas")

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}

export async function saveDailyBackup(companyId: string): Promise<string> {
  try {
    console.log("[v0] Starting daily backup for company:", companyId)

    const data = await createBackup(companyId)
    const fileName = `backup_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`
    const buffer = await exportToExcel(data, fileName)

    // Save backup record to database
    const backup = await prisma.backup.create({
      data: {
        type: "daily",
        status: "completed",
        fileName,
        fileSize: buffer.length,
        companyId,
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    console.log("[v0] Daily backup completed:", backup.id)
    return backup.id
  } catch (error) {
    console.error("[v0] Error creating daily backup:", error)

    // Save failed backup record
    await prisma.backup.create({
      data: {
        type: "daily",
        status: "failed",
        fileName: `backup_failed_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`,
        companyId,
      },
    })

    throw error
  }
}

export async function getDailyMovement(companyId: string, date?: Date): Promise<BackupData> {
  const targetDate = date || new Date()
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  console.log("[v0] Getting daily movement for:", format(targetDate, "dd/MM/yyyy", { locale: ptBR }))

  const [clients, products, orders, activities, invoices] = await Promise.all([
    prisma.client.findMany({
      where: {
        companyId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.product.findMany({
      where: {
        companyId,
        OR: [{ createdAt: { gte: startOfDay, lte: endOfDay } }, { updatedAt: { gte: startOfDay, lte: endOfDay } }],
      },
    }),
    prisma.serviceOrder.findMany({
      where: {
        companyId,
        OR: [{ createdAt: { gte: startOfDay, lte: endOfDay } }, { updatedAt: { gte: startOfDay, lte: endOfDay } }],
      },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        technician: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, brand: true, model: true } },
          },
        },
      },
    }),
    prisma.activity.findMany({
      where: {
        order: { companyId },
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } },
      },
    }),
    prisma.invoice.findMany({
      where: {
        companyId,
        OR: [{ createdAt: { gte: startOfDay, lte: endOfDay } }, { updatedAt: { gte: startOfDay, lte: endOfDay } }],
      },
      include: {
        order: { select: { orderNumber: true, client: { select: { name: true } } } },
      },
    }),
  ])

  return { clients, products, orders, activities, invoices }
}

// Schedule daily backups for all active companies
export function scheduleDailyBackups() {
  // Run daily at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("[v0] Running scheduled daily backups")

    try {
      const companies = await prisma.company.findMany({
        where: { isActive: true },
        include: { settings: true },
      })

      for (const company of companies) {
        if (company.settings?.autoBackup) {
          try {
            await saveDailyBackup(company.id)
          } catch (error) {
            console.error(`[v0] Failed to backup company ${company.id}:`, error)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error in scheduled backup job:", error)
    }
  })

  console.log("[v0] Daily backup scheduler initialized")
}

// Clean up expired backups
export function scheduleBackupCleanup() {
  // Run daily at 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    console.log("[v0] Running backup cleanup")

    try {
      const expiredBackups = await prisma.backup.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      })

      console.log(`[v0] Cleaned up ${expiredBackups.count} expired backups`)
    } catch (error) {
      console.error("[v0] Error in backup cleanup:", error)
    }
  })

  console.log("[v0] Backup cleanup scheduler initialized")
}
