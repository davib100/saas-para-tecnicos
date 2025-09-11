"use client"

import { useState } from "react"
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
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ExcelExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExcelExportModal({ open, onOpenChange }: ExcelExportModalProps) {
  const [exportType, setExportType] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const exportOptions = [
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

  const tableOptions = [
    { id: "orders", label: "Ordens de Serviço", icon: FileText, count: 156 },
    { id: "clients", label: "Clientes", icon: Users, count: 89 },
    { id: "products", label: "Produtos", icon: Package, count: 234 },
    { id: "activities", label: "Atividades", icon: Clock, count: 1247 },
    { id: "invoices", label: "Faturas", icon: DollarSign, count: 78 },
    { id: "users", label: "Usuários", icon: Users, count: 5 },
  ]

  const handleExportTypeChange = (type: string) => {
    setExportType(type)
    const option = exportOptions.find((opt) => opt.id === type)
    if (option) {
      setSelectedTables(option.tables)
    }
  }

  const handleTableToggle = (tableId: string) => {
    setSelectedTables((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
  }

  const handleExport = async () => {
    if (!exportType) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      let url = ""
      const params = new URLSearchParams()

      if (exportType === "daily") {
        url = "/api/export/daily"
        if (dateRange.from) {
          params.append("date", dateRange.from.toISOString())
        }
      } else if (exportType === "period") {
        url = "/api/export/period"
        if (dateRange.from) params.append("from", dateRange.from.toISOString())
        if (dateRange.to) params.append("to", dateRange.to.toISOString())
        params.append("tables", selectedTables.join(","))
      } else if (exportType === "complete") {
        url = "/api/export/complete"
        params.append("tables", selectedTables.join(","))
      }

      const response = await fetch(`${url}?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Erro ao exportar dados")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl

      const fileName =
        response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ||
        `export_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`

      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      clearInterval(progressInterval)
      setExportProgress(100)

      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        onOpenChange(false)
      }, 1000)
    } catch (error) {
      console.error("[v0] Export error:", error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Exportar para Excel
          </DialogTitle>
          <DialogDescription>Selecione o tipo de exportação e configure as opções desejadas</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipo de Exportação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      exportType === option.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50",
                    )}
                    onClick={() => handleExportTypeChange(option.id)}
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
                      <CardDescription className="text-sm">{option.description}</CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Date Range Selection */}
          {exportType && (exportType === "daily" || exportType === "period") && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Período</h3>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
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
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table Selection */}
          {exportType && (exportType === "period" || exportType === "complete") && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados para Exportar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tableOptions.map((table) => {
                  const Icon = table.icon
                  const isSelected = selectedTables.includes(table.id)

                  return (
                    <div
                      key={table.id}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border transition-colors",
                        isSelected ? "bg-primary/5 border-primary" : "hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        id={table.id}
                        checked={isSelected}
                        onCheckedChange={() => handleTableToggle(table.id)}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor={table.id} className="flex-1 cursor-pointer">
                          {table.label}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {table.count}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Exportando dados...</span>
                  <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={!exportType || isExporting || (exportType === "daily" && !dateRange.from)}
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
                  Exportar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
