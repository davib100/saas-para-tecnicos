"use client"

import { useState, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import {
  Download,
  FileSpreadsheet,
  CalendarIcon,
  Filter,
  Clock,
  FileText,
  Users,
  Package,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import * as ExcelJS from "exceljs"

interface ExcelExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ExportType = "daily" | "period" | "complete"

interface ExportOption {
  id: ExportType
  title: string
  description: string
  icon: typeof Calendar
  color: string
  tables: string[]
}

interface TableOption {
  id: string
  label: string
  icon: typeof FileText
  count: number
}

interface DateRange {
  from?: Date
  to?: Date
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "daily",
    title: "Movimentação Diária",
    description: "Exportar todas as atividades do dia selecionado",
    icon: Calendar,
    color: "bg-blue-500",
    tables: ["orders", "activities", "invoices"],
  },
  {
    id: "period",
    title: "Período Personalizado",
    description: "Exportar dados de um período específico",
    icon: Filter,
    color: "bg-green-500",
    tables: ["orders", "clients", "products", "activities", "invoices"],
  },
  {
    id: "complete",
    title: "Backup Completo",
    description: "Exportar todos os dados do sistema",
    icon: FileSpreadsheet,
    color: "bg-purple-500",
    tables: ["orders", "clients", "products", "activities", "invoices", "users"],
  },
]

const TABLE_OPTIONS: TableOption[] = [
  { id: "orders", label: "Ordens de Serviço", icon: FileText, count: 156 },
  { id: "clients", label: "Clientes", icon: Users, count: 89 },
  { id: "products", label: "Produtos", icon: Package, count: 234 },
  { id: "activities", label: "Atividades", icon: Clock, count: 1247 },
  { id: "invoices", label: "Faturas", icon: DollarSign, count: 78 },
  { id: "users", label: "Usuários", icon: Users, count: 5 },
]

export function ExcelExportModal({ open, onOpenChange }: ExcelExportModalProps) {
  const [exportType, setExportType] = useState<ExportType | "">("")
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const selectedOption = useMemo(
    () => EXPORT_OPTIONS.find((opt) => opt.id === exportType),
    [exportType]
  )

  const isExportDisabled = useMemo(() => {
    if (!exportType) return true
    if (exportType === "daily" && !dateRange.from) return true
    if (exportType === "period" && (!dateRange.from || !dateRange.to)) return true
    if ((exportType === "period" || exportType === "complete") && selectedTables.length === 0) return true
    return false
  }, [exportType, dateRange, selectedTables])

  const handleExportTypeChange = useCallback((type: ExportType) => {
    setExportType(type)
    const option = EXPORT_OPTIONS.find((opt) => opt.id === type)
    if (option) {
      setSelectedTables(option.tables)
    }
  }, [])

  const handleTableToggle = useCallback((tableId: string) => {
    setSelectedTables((prev) => 
      prev.includes(tableId) 
        ? prev.filter((id) => id !== tableId) 
        : [...prev, tableId]
    )
  }, [])

  const fetchDataForExport = async (endpoint: string, params: URLSearchParams) => {
    const response = await fetch(`${endpoint}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.statusText}`)
    }
    
    return response.json()
  }

  const createWorkbook = async (data: any, exportType: ExportType) => {
    const workbook = new ExcelJS.Workbook()
    
    workbook.creator = "Sistema de Gestão Técnica"
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = false

    const worksheetStyle = {
      font: { name: 'Arial', size: 10 },
      alignment: { vertical: 'middle' as const },
    }

    const headerStyle = {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: '4472C4' } },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
      border: {
        top: { style: 'thin' as const },
        left: { style: 'thin' as const },
        bottom: { style: 'thin' as const },
        right: { style: 'thin' as const }
      }
    }

    for (const tableId of selectedTables) {
      if (data[tableId] && Array.isArray(data[tableId])) {
        const tableData = data[tableId]
        if (tableData.length === 0) continue

        const tableConfig = TABLE_OPTIONS.find(t => t.id === tableId)
        const worksheet = workbook.addWorksheet(tableConfig?.label || tableId)

        const columns = Object.keys(tableData[0])
        const headers = columns.map(col => ({
          header: col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'),
          key: col,
          width: Math.max(col.length + 2, 15)
        }))

        worksheet.columns = headers

        worksheet.getRow(1).eachCell((cell) => {
          Object.assign(cell, headerStyle)
        })

        tableData.forEach((row: any) => {
          const worksheetRow = worksheet.addRow(row)
          worksheetRow.eachCell((cell) => {
            Object.assign(cell, worksheetStyle)
            
            if (cell.value instanceof Date) {
              cell.numFmt = 'dd/mm/yyyy hh:mm'
            } else if (typeof cell.value === 'number' && col.includes('price') || col.includes('value')) {
              cell.numFmt = 'R$ #,##0.00'
            }
          })
        })

        worksheet.autoFilter = {
          from: 'A1',
          to: { row: 1, column: columns.length }
        }
      }
    }

    const summaryWorksheet = workbook.addWorksheet('Resumo da Exportação')
    
    summaryWorksheet.addRow(['Relatório de Exportação'])
    summaryWorksheet.addRow(['Data da Exportação:', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })])
    summaryWorksheet.addRow(['Tipo de Exportação:', selectedOption?.title || exportType])
    
    if (dateRange.from) {
      summaryWorksheet.addRow(['Data Inicial:', format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })])
    }
    if (dateRange.to) {
      summaryWorksheet.addRow(['Data Final:', format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })])
    }
    
    summaryWorksheet.addRow(['Tabelas Exportadas:'])
    selectedTables.forEach(tableId => {
      const tableConfig = TABLE_OPTIONS.find(t => t.id === tableId)
      summaryWorksheet.addRow(['', `• ${tableConfig?.label || tableId}`])
    })

    summaryWorksheet.getColumn(1).width = 20
    summaryWorksheet.getColumn(2).width = 30

    return workbook
  }

  const downloadWorkbook = async (workbook: ExcelJS.Workbook, filename: string) => {
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const simulateProgress = useCallback((callback: () => void) => {
    const steps = [0, 20, 40, 60, 80, 90]
    let currentStep = 0
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setExportProgress(steps[currentStep])
        currentStep++
      } else {
        clearInterval(interval)
        setExportProgress(100)
        setTimeout(callback, 500)
      }
    }, 300)
    
    return interval
  }, [])

  const handleExport = async () => {
    if (isExportDisabled || !exportType) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      const params = new URLSearchParams()
      let endpoint = ""

      switch (exportType) {
        case "daily":
          endpoint = "/api/export/daily"
          if (dateRange.from) {
            params.append("date", dateRange.from.toISOString())
          }
          break
        case "period":
          endpoint = "/api/export/period"
          if (dateRange.from) params.append("from", dateRange.from.toISOString())
          if (dateRange.to) params.append("to", dateRange.to.toISOString())
          params.append("tables", selectedTables.join(","))
          break
        case "complete":
          endpoint = "/api/export/complete"
          params.append("tables", selectedTables.join(","))
          break
      }

      const progressInterval = simulateProgress(async () => {
        try {
          const data = await fetchDataForExport(endpoint, params)
          const workbook = await createWorkbook(data, exportType)
          
          const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss")
          const filename = `${exportType}_export_${timestamp}.xlsx`
          
          await downloadWorkbook(workbook, filename)
          
          toast({
            title: "Exportação concluída",
            description: `Arquivo ${filename} baixado com sucesso!`,
          })
          
          onOpenChange(false)
        } catch (error) {
          console.error("Export error:", error)
          toast({
            title: "Erro na exportação",
            description: error instanceof Error ? error.message : "Erro desconhecido",
            variant: "destructive",
          })
        } finally {
          setIsExporting(false)
          setExportProgress(0)
        }
      })

    } catch (error) {
      console.error("Export initialization error:", error)
      toast({
        title: "Erro na exportação",
        description: "Falha ao inicializar a exportação",
        variant: "destructive",
      })
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const resetModal = useCallback(() => {
    setExportType("")
    setDateRange({})
    setSelectedTables([])
    setExportProgress(0)
    setIsExporting(false)
  }, [])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !isExporting) {
      resetModal()
    }
    onOpenChange(newOpen)
  }, [isExporting, onOpenChange, resetModal])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Exportar para Excel
          </DialogTitle>
          <DialogDescription>
            Selecione o tipo de exportação e configure as opções desejadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipo de Exportação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXPORT_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = exportType === option.id
                
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected 
                        ? "ring-2 ring-primary border-primary" 
                        : "hover:border-primary/50",
                      isExporting && "opacity-50 pointer-events-none"
                    )}
                    onClick={() => !isExporting && handleExportTypeChange(option.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", option.color)}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <CardTitle className="text-base">{option.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {exportType && (exportType === "daily" || exportType === "period") && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Período</h3>
              <div className="flex gap-4 flex-wrap">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isExporting}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from 
                          ? format(dateRange.from, "dd/MM/yyyy", { locale: ptBR }) 
                          : "Selecionar data"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {exportType === "period" && (
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isExporting}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to 
                            ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR }) 
                            : "Selecionar data"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                          disabled={(date) => 
                            dateRange.from ? date < dateRange.from : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
          )}

          {exportType && (exportType === "period" || exportType === "complete") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Dados para Exportar</h3>
                <div className="text-sm text-muted-foreground">
                  {selectedTables.length} de {TABLE_OPTIONS.length} selecionados
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TABLE_OPTIONS.map((table) => {
                  const Icon = table.icon
                  const isSelected = selectedTables.includes(table.id)

                  return (
                    <div
                      key={table.id}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border transition-colors",
                        isSelected ? "bg-primary/5 border-primary" : "hover:bg-muted/50",
                        isExporting && "opacity-50"
                      )}
                    >
                      <Checkbox
                        id={table.id}
                        checked={isSelected}
                        disabled={isExporting}
                        onCheckedChange={() => handleTableToggle(table.id)}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <Label 
                          htmlFor={table.id} 
                          className={cn(
                            "flex-1 cursor-pointer",
                            isExporting && "pointer-events-none"
                          )}
                        >
                          {table.label}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {table.count.toLocaleString('pt-BR')}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isExporting && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preparando exportação...</span>
                  <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            </div>
          )}

          {isExportDisabled && exportType && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {exportType === "daily" && !dateRange.from && "Selecione uma data para continuar"}
                {exportType === "period" && (!dateRange.from || !dateRange.to) && "Selecione as datas inicial e final"}
                {(exportType === "period" || exportType === "complete") && selectedTables.length === 0 && "Selecione pelo menos uma tabela para exportar"}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)} 
              disabled={isExporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExportDisabled || isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}