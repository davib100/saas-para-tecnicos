import { prisma } from "./prisma"
import * as ExcelJS from "exceljs"
import cron from "node-cron"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Decimal } from "@prisma/client/runtime/library";

export type Client = {
  id: string
  nome: string
  telefone: string
  tipo: string
  documento: string
  rua: string
  numero: string
  cidade: string
  estado: string
  cep: string
  isActive: boolean
  createdAt: Date
}

export type Product = {
  id: string
  name: string
  brand?: string | null
  model?: string | null
  category?: string | null
  description?: string | null
  price?: Decimal | null
  cost?: Decimal | null
  stock: number
  minStock: number
  barcode?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

export type Order = {
  orderNumber: string
  client: { nome: string; telefone: string }
  equipment: string
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  problem: string
  diagnosis?: string | null
  solution?: string | null
  status: string
  priority: string
  estimatedValue?: Decimal | null
  finalValue?: Decimal | null
  laborCost?: Decimal | null
  partsCost?: Decimal | null
  estimatedDate?: Date | null
  completedDate?: Date | null
  warrantyUntil?: Date | null
  technician?: { name: string } | null
  observations?: string | null
  createdAt: Date
  updatedAt?: Date
}

export type Activity = {
  type: string
  description: string
  order: { orderNumber: string }
  user: { name: string }
  createdAt: Date
}

export type Invoice = {
  number: string
  order: { orderNumber: string; client: { nome: string } }
  status: string
  total: Decimal
  dueDate: Date
  paidDate: Date | null
  paymentMethod: string | null
  notes: string | null
  createdAt: Date
  updatedAt?: Date
}

export type BackupData = {
  clients: Client[]
  products: Product[]
  orders: Order[]
  activities: Activity[]
  invoices: Invoice[]
}

export type ColumnConfig = {
  key: string
  header: string
  width?: number
  format?: (value: any) => string
}

export type WorksheetConfig = {
  name: string
  data: any[]
  columns: ColumnConfig[]
}

export type Backup = {
  id: string
  type: "DAILY" | "WEEKLY" | "MONTHLY"
  status: "COMPLETED" | "FAILED"
  fileName: string
  fileSize: number
  companyId: string
  completedAt?: Date
  expiresAt?: Date
  errorMessage?: string
}

const validateClientType = (tipo: string | null | undefined): string => {
  const normalizedType = tipo?.trim().toUpperCase()
  
  if (normalizedType === "PF" || normalizedType === "PJ") {
    return normalizedType
  }
  
  if (!tipo || tipo.trim() === "") {
    throw new Error("Tipo de cliente não pode estar vazio")
  }
  
  throw new Error(`Tipo de cliente inválido: "${tipo}". Deve ser "PF" ou "PJ"`)
}

const COMPANY_QUERIES = {
  clients: (companyId: string) => ({
    where: { companyId },
    orderBy: { createdAt: "desc" as const },
  }),
  
  products: (companyId: string) => ({
    where: { companyId },
    orderBy: { createdAt: "desc" as const },
  }),
  
  orders: (companyId: string) => ({
    where: { companyId },
    include: {
      client: { select: { nome: true, telefone: true } },
      technician: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, brand: true, model: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  }),
  
  activities: (companyId: string) => ({
    where: { order: { companyId } },
    include: {
      user: { select: { name: true, email: true } },
      order: { select: { orderNumber: true } },
    },
    orderBy: { createdAt: "desc" as const },
  }),
  
  invoices: (companyId: string) => ({
    where: { companyId },
    include: {
      order: { select: { orderNumber: true, client: { select: { nome: true } } } },
    },
    orderBy: { createdAt: "desc" as const },
  }),
} as const

const formatCurrency = (value: Decimal | number | null): string => {
  if (!value) return "R$ 0,00"
  const numValue = typeof value === 'number' ? value : value.toNumber()
  return `R$ ${numValue.toFixed(2).replace('.', ',')}`
}

const formatDate = (date: Date | null): string => {
  if (!date) return ""
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
}

const formatDateTime = (date: Date | null): string => {
  if (!date) return ""
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
}

const formatBoolean = (value: boolean): string => value ? "Sim" : "Não"

const WORKSHEET_CONFIGS: Record<string, WorksheetConfig> = {
  clients: {
    name: "Clientes",
    data: [],
    columns: [
      { key: "id", header: "ID", width: 15 },
      { key: "nome", header: "Nome", width: 30 },
      { key: "telefone", header: "Telefone", width: 15 },
      { key: "tipo", header: "Tipo", width: 10 },
      { key: "documento", header: "Documento", width: 20 },
      { key: "rua", header: "Rua", width: 30 },
      { key: "numero", header: "Número", width: 10 },
      { key: "cidade", header: "Cidade", width: 20 },
      { key: "estado", header: "Estado", width: 10 },
      { key: "cep", header: "CEP", width: 12 },
      { key: "isActive", header: "Ativo", width: 10, format: formatBoolean },
      { key: "createdAt", header: "Data Criação", width: 20, format: formatDateTime },
    ],
  },
  
  products: {
    name: "Produtos",
    data: [],
    columns: [
      { key: "id", header: "ID", width: 15 },
      { key: "name", header: "Nome", width: 30 },
      { key: "brand", header: "Marca", width: 20 },
      { key: "model", header: "Modelo", width: 20 },
      { key: "category", header: "Categoria", width: 20 },
      { key: "description", header: "Descrição", width: 40 },
      { key: "price", header: "Preço", width: 15, format: formatCurrency },
      { key: "cost", header: "Custo", width: 15, format: formatCurrency },
      { key: "stock", header: "Estoque", width: 12 },
      { key: "minStock", header: "Estoque Mínimo", width: 15 },
      { key: "barcode", header: "Código Barras", width: 20 },
      { key: "isActive", header: "Ativo", width: 10, format: formatBoolean },
      { key: "createdAt", header: "Data Criação", width: 20, format: formatDateTime },
    ],
  },
  
  orders: {
    name: "Ordens de Serviço",
    data: [],
    columns: [
      { key: "orderNumber", header: "Número OS", width: 15 },
      { key: "clientName", header: "Cliente", width: 30 },
      { key: "equipment", header: "Equipamento", width: 25 },
      { key: "brand", header: "Marca", width: 20 },
      { key: "model", header: "Modelo", width: 20 },
      { key: "serialNumber", header: "Número Série", width: 20 },
      { key: "problem", header: "Problema", width: 40 },
      { key: "diagnosis", header: "Diagnóstico", width: 40 },
      { key: "solution", header: "Solução", width: 40 },
      { key: "status", header: "Status", width: 15 },
      { key: "priority", header: "Prioridade", width: 12 },
      { key: "estimatedValue", header: "Valor Estimado", width: 18, format: formatCurrency },
      { key: "finalValue", header: "Valor Final", width: 18, format: formatCurrency },
      { key: "laborCost", header: "Custo Mão de Obra", width: 20, format: formatCurrency },
      { key: "partsCost", header: "Custo Peças", width: 18, format: formatCurrency },
      { key: "estimatedDate", header: "Data Estimada", width: 18, format: formatDate },
      { key: "completedDate", header: "Data Conclusão", width: 18, format: formatDate },
      { key: "warrantyUntil", header: "Garantia Até", width: 18, format: formatDate },
      { key: "technicianName", header: "Técnico", width: 25 },
      { key: "observations", header: "Observações", width: 40 },
      { key: "createdAt", header: "Data Criação", width: 20, format: formatDateTime },
    ],
  },
  
  activities: {
    name: "Atividades",
    data: [],
    columns: [
      { key: "orderNumber", header: "Número OS", width: 15 },
      { key: "type", header: "Tipo", width: 20 },
      { key: "description", header: "Descrição", width: 50 },
      { key: "userName", header: "Usuário", width: 25 },
      { key: "createdAt", header: "Data/Hora", width: 20, format: formatDateTime },
    ],
  },
  
  invoices: {
    name: "Faturas",
    data: [],
    columns: [
      { key: "number", header: "Número Fatura", width: 18 },
      { key: "orderNumber", header: "Número OS", width: 15 },
      { key: "clientName", header: "Cliente", width: 30 },
      { key: "status", header: "Status", width: 15 },
      { key: "amount", header: "Valor", width: 18, format: formatCurrency },
      { key: "dueDate", header: "Data Vencimento", width: 18, format: formatDate },
      { key: "paidDate", header: "Data Pagamento", width: 18, format: formatDate },
      { key: "paymentMethod", header: "Método Pagamento", width: 20 },
      { key: "notes", header: "Observações", width: 40 },
      { key: "createdAt", header: "Data Criação", width: 20, format: formatDateTime },
    ],
  },
}

const transformDataForExport = (rawData: BackupData): Record<string, any[]> => {
  return {
    clients: rawData.clients.map((client, index) => {
      try {
        const validatedType = validateClientType(client.tipo)
        return {
          id: client.id,
          nome: client.nome,
          telefone: client.telefone || "",
          tipo: validatedType,
          documento: client.documento,
          rua: client.rua,
          numero: client.numero,
          cidade: client.cidade,
          estado: client.estado,
          cep: client.cep,
          isActive: client.isActive,
          createdAt: client.createdAt,
        }
      } catch (error) {
        console.error(`[TRANSFORM] Error validating client type at index ${index}:`, error)
        throw new Error(`Cliente "${client.nome}" (ID: ${client.id}): ${error instanceof Error ? error.message : 'Erro na validação do tipo'}`)
      }
    }),
    
    products: rawData.products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand || "",
      model: product.model || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price ? product.price.toNumber() : 0,
      cost: product.cost ? product.cost.toNumber() : 0,
      stock: product.stock,
      minStock: product.minStock,
      barcode: product.barcode || "",
      isActive: product.isActive,
      createdAt: product.createdAt,
    })),
    
    orders: rawData.orders.map(order => ({
      orderNumber: order.orderNumber,
      clientName: order.client.nome,
      equipment: order.equipment,
      brand: order.brand || "",
      model: order.model || "",
      serialNumber: order.serialNumber || "",
      problem: order.problem,
      diagnosis: order.diagnosis || "",
      solution: order.solution || "",
      status: order.status,
      priority: order.priority,
      estimatedValue: order.estimatedValue ? order.estimatedValue.toNumber() : 0,
      finalValue: order.finalValue ? order.finalValue.toNumber() : 0,
      laborCost: order.laborCost ? order.laborCost.toNumber() : 0,
      partsCost: order.partsCost ? order.partsCost.toNumber() : 0,
      estimatedDate: order.estimatedDate,
      completedDate: order.completedDate,
      warrantyUntil: order.warrantyUntil,
      technicianName: order.technician?.name || "",
      observations: order.observations || "",
      createdAt: order.createdAt,
    })),
    
    activities: rawData.activities.map(activity => ({
      orderNumber: activity.order.orderNumber,
      type: activity.type,
      description: activity.description,
      userName: activity.user.name,
      createdAt: activity.createdAt,
    })),
    
    invoices: rawData.invoices.map(invoice => ({
      number: invoice.number,
      orderNumber: invoice.order.orderNumber,
      clientName: invoice.order.client.nome,
      status: invoice.status,
      amount: invoice.total.toNumber(),
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      paymentMethod: invoice.paymentMethod || "",
      notes: invoice.notes || "",
      createdAt: invoice.createdAt,
    })),
  }
}

export async function createBackup(companyId: string): Promise<BackupData> {
  console.log("[BACKUP] Creating backup for company:", companyId)

  try {
    const [clients, products, orders, activities, invoices] = await Promise.all([
      prisma.client.findMany(COMPANY_QUERIES.clients(companyId)),
      prisma.product.findMany(COMPANY_QUERIES.products(companyId)),
      prisma.serviceOrder.findMany(COMPANY_QUERIES.orders(companyId)),
      prisma.activity.findMany(COMPANY_QUERIES.activities(companyId)),
      prisma.invoice.findMany(COMPANY_QUERIES.invoices(companyId)),
    ])

    console.log(`[BACKUP] Retrieved data - Clients: ${clients.length}, Products: ${products.length}, Orders: ${orders.length}, Activities: ${activities.length}, Invoices: ${invoices.length}`)

    return { clients, products, orders, activities, invoices }
  } catch (error) {
    console.error("[BACKUP] Error creating backup:", error)
    throw new Error(`Failed to create backup for company ${companyId}: ${error}`)
  }
}

const createWorksheet = async (workbook: ExcelJS.Workbook, config: WorksheetConfig, data: any[]) => {
  const worksheet = workbook.addWorksheet(config.name)
  
  const columns = config.columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }))
  
  worksheet.columns = columns

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  }

  const cellStyle: Partial<ExcelJS.Style> = {
    font: { name: 'Arial', size: 10 },
    alignment: { vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  }

  worksheet.getRow(1).eachCell(cell => {
    Object.assign(cell, headerStyle)
  })

  data.forEach(item => {
    const rowData: any = {}
    
    config.columns.forEach(col => {
      let value = item[col.key]
      
      if (value !== null && value !== undefined) {
        if (col.format) {
          rowData[col.key] = col.format(value)
        } else if (value instanceof Date) {
          rowData[col.key] = formatDateTime(value)
        } else {
          rowData[col.key] = value
        }
      } else {
        rowData[col.key] = ""
      }
    })
    
    const row = worksheet.addRow(rowData)
    row.eachCell(cell => {
      Object.assign(cell, cellStyle)
    })
  })

  if (data.length > 0) {
    worksheet.autoFilter = {
      from: 'A1',
      to: { row: 1, column: config.columns.length }
    }
  }
}

const createSummaryWorksheet = (workbook: ExcelJS.Workbook, data: BackupData, exportType: string = "complete") => {
  const worksheet = workbook.addWorksheet('Resumo da Exportação')
  
  const summaryData = [
    ['Relatório de Backup/Exportação'],
    ['Data da Exportação:', formatDateTime(new Date())],
    ['Tipo de Exportação:', exportType.charAt(0).toUpperCase() + exportType.slice(1)],
    [''],
    ['Resumo dos Dados:'],
    ['• Clientes:', data.clients.length.toString()],
    ['• Produtos:', data.products.length.toString()],
    ['• Ordens de Serviço:', data.orders.length.toString()],
    ['• Atividades:', data.activities.length.toString()],
    ['• Faturas:', data.invoices.length.toString()],
    [''],
    ['Total de Registros:', (data.clients.length + data.products.length + data.orders.length + data.activities.length + data.invoices.length).toString()]
  ]

  summaryData.forEach((row, index) => {
    const worksheetRow = worksheet.addRow(row)
    
    if (index === 0) {
      worksheetRow.font = { bold: true, size: 14 }
    } else if (index === 4 || row[0].includes('•')) {
      worksheetRow.font = { bold: true }
    }
  })

  worksheet.getColumn(1).width = 25
  worksheet.getColumn(2).width = 30
}

export async function exportToExcel(data: BackupData, fileName?: string, exportType: string = "complete"): Promise<Buffer> {
  console.log("[EXPORT] Exporting data to Excel format")

  try {
    const workbook = new ExcelJS.Workbook()
    
    workbook.creator = "Sistema de Gestão Técnica"
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = false

    const transformedData = transformDataForExport(data)

    createSummaryWorksheet(workbook, data, exportType)

    const worksheetPromises = Object.entries(WORKSHEET_CONFIGS).map(async ([key, config]) => {
      const worksheetData = transformedData[key] || []
      if (worksheetData.length > 0) {
        await createWorksheet(workbook, config, worksheetData)
      }
    })

    await Promise.all(worksheetPromises)

    const buffer = await workbook.xlsx.writeBuffer()
    console.log(`[EXPORT] Excel file created successfully. Size: ${buffer.byteLength} bytes`)
    
    return Buffer.from(buffer)
  } catch (error) {
    console.error("[EXPORT] Error exporting to Excel:", error)
    throw new Error(`Failed to export data to Excel: ${error}`)
  }
}

export async function saveDailyBackup(companyId: string): Promise<string> {
  const startTime = Date.now()
  console.log("[BACKUP] Starting daily backup for company:", companyId)

  try {
    const data = await createBackup(companyId)
    const fileName = `backup_diario_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`
    const buffer = await exportToExcel(data, fileName, "daily")

    const backup = await prisma.backup.create({
      data: {
        type: "DAILY",
        status: "COMPLETED",
        fileName,
        fileSize: buffer.byteLength,
        companyId,
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    const duration = Date.now() - startTime
    console.log(`[BACKUP] Daily backup completed in ${duration}ms:`, backup.id)
    
    return backup.id
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[BACKUP] Error creating daily backup after ${duration}ms:`, error)

    await prisma.backup.create({
      data: {
        type: "DAILY",
        status: "FAILED",
        fileName: `backup_falhou_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`,
        fileSize: 0,
        companyId,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    }).catch(dbError => {
      console.error("[BACKUP] Failed to save backup failure record:", dbError)
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

  console.log("[MOVEMENT] Getting daily movement for:", formatDate(targetDate))

  try {
    const dateFilter = { gte: startOfDay, lte: endOfDay }
    
    const [clients, products, orders, activities, invoices] = await Promise.all([
      prisma.client.findMany({
        where: { companyId, createdAt: dateFilter },
        orderBy: { createdAt: "desc" },
      }),
      
      prisma.product.findMany({
        where: {
          companyId,
          OR: [
            { createdAt: dateFilter },
            { updatedAt: dateFilter }
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
      
      prisma.serviceOrder.findMany({
        where: {
          companyId,
          OR: [
            { createdAt: dateFilter },
            { updatedAt: dateFilter }
          ],
        },
        include: COMPANY_QUERIES.orders(companyId).include,
        orderBy: { createdAt: "desc" },
      }),
      
      prisma.activity.findMany({
        where: {
          order: { companyId },
          createdAt: dateFilter,
        },
        include: COMPANY_QUERIES.activities(companyId).include,
        orderBy: { createdAt: "desc" },
      }),
      
      prisma.invoice.findMany({
        where: {
          companyId,
          OR: [
            { createdAt: dateFilter },
            { updatedAt: dateFilter }
          ],
        },
        include: COMPANY_QUERIES.invoices(companyId).include,
        orderBy: { createdAt: "desc" },
      }),
    ])

    console.log(`[MOVEMENT] Daily movement retrieved - Clients: ${clients.length}, Products: ${products.length}, Orders: ${orders.length}, Activities: ${activities.length}, Invoices: ${invoices.length}`)

    return { clients, products, orders, activities, invoices }
  } catch (error) {
    console.error("[MOVEMENT] Error getting daily movement:", error)
    throw new Error(`Failed to get daily movement for ${formatDate(targetDate)}: ${error}`)
  }
}

export function scheduleDailyBackups() {
  cron.schedule("0 2 * * *", async () => {
    console.log("[SCHEDULER] Running scheduled daily backups at", formatDateTime(new Date()))

    try {
      const companies = await prisma.company.findMany({
        where: { status: "ACTIVE" },
        include: { settings: true },
      })

      console.log(`[SCHEDULER] Found ${companies.length} active companies`)

      const backupPromises = companies
        .filter(company => company.settings?.autoBackup)
        .map(async company => {
          try {
            const backupId = await saveDailyBackup(company.id)
            console.log(`[SCHEDULER] Backup successful for company ${company.id}: ${backupId}`)
            return { companyId: company.id, success: true, backupId }
          } catch (error) {
            console.error(`[SCHEDULER] Backup failed for company ${company.id}:`, error)
            return { companyId: company.id, success: false, error: error instanceof Error ? error.message : "Unknown error" }
          }
        })

      const results = await Promise.allSettled(backupPromises)
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.length - successful

      console.log(`[SCHEDULER] Backup job completed: ${successful} successful, ${failed} failed`)
    } catch (error) {
      console.error("[SCHEDULER] Error in scheduled backup job:", error)
    }
  }, {
    timezone: "America/Sao_Paulo"
  })

  console.log("[SCHEDULER] Daily backup scheduler initialized for 02:00 AM (America/Sao_Paulo)")
}

export function scheduleBackupCleanup() {
  cron.schedule("0 3 * * *", async () => {
    console.log("[CLEANUP] Running backup cleanup at", formatDateTime(new Date()))

    try {
      const expiredBackups = await prisma.backup.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      })

      console.log(`[CLEANUP] Cleaned up ${expiredBackups.count} expired backups`)
      
      const oldFailedBackups = await prisma.backup.deleteMany({
        where: {
          status: "FAILED",
          createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
      })

      console.log(`[CLEANUP] Cleaned up ${oldFailedBackups.count} old failed backups`)
    } catch (error) {
      console.error("[CLEANUP] Error in backup cleanup:", error)
    }
  }, {
    timezone: "America/Sao_Paulo"
  })

  console.log("[CLEANUP] Backup cleanup scheduler initialized for 03:00 AM (America/Sao_Paulo)")
}
