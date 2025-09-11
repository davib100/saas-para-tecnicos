"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  ArrowLeft,
  CheckCircle,
  Package,
  Wrench,
} from "lucide-react"
import { FinancialCharts } from "@/components/financial-charts"

interface FinancialData {
  date: string
  osClosedCount: number
  osClosedValue: number
  productsSoldCount: number
  productsSoldValue: number
  expenses: number
  totalIncome: number
  totalExpenses: number
}

interface Expense {
  id: string
  name: string
  category: string
  value: number
  date: string
  createdAt: string
}

type ExpenseCategory = "manutenção" | "transporte" | "administrativo"

const mockFinancialData: FinancialData[] = [
  {
    date: "2024-01-15",
    osClosedCount: 8,
    osClosedValue: 2400,
    productsSoldCount: 12,
    productsSoldValue: 850,
    expenses: 320,
    totalIncome: 3250,
    totalExpenses: 320,
  },
  {
    date: "2024-01-14",
    osClosedCount: 6,
    osClosedValue: 1800,
    productsSoldCount: 8,
    productsSoldValue: 640,
    expenses: 280,
    totalIncome: 2440,
    totalExpenses: 280,
  },
  {
    date: "2024-01-13",
    osClosedCount: 10,
    osClosedValue: 3200,
    productsSoldCount: 15,
    productsSoldValue: 1200,
    expenses: 450,
    totalIncome: 4400,
    totalExpenses: 450,
  },
  {
    date: "2024-01-12",
    osClosedCount: 5,
    osClosedValue: 1500,
    productsSoldCount: 6,
    productsSoldValue: 480,
    expenses: 200,
    totalIncome: 1980,
    totalExpenses: 200,
  },
  {
    date: "2024-01-11",
    osClosedCount: 7,
    osClosedValue: 2100,
    productsSoldCount: 10,
    productsSoldValue: 750,
    expenses: 350,
    totalIncome: 2850,
    totalExpenses: 350,
  },
]

const mockExpenses: Expense[] = [
  {
    id: "EXP001",
    name: "Compra de peças para estoque",
    category: "manutenção",
    value: 150.0,
    date: "2024-01-15",
    createdAt: "2024-01-15T10:30:00",
  },
  {
    id: "EXP002",
    name: "Combustível para entrega",
    category: "transporte",
    value: 80.0,
    date: "2024-01-15",
    createdAt: "2024-01-15T14:20:00",
  },
  {
    id: "EXP003",
    name: "Material de escritório",
    category: "administrativo",
    value: 90.0,
    date: "2024-01-14",
    createdAt: "2024-01-14T16:45:00",
  },
]

interface FinancialDashboardProps {
  onBack: () => void
}

interface ExpenseFormData {
  name: string
  category: ExpenseCategory
  value: number
  date: string
}

const validateExpenseForm = (form: ExpenseFormData): string[] => {
  const errors: string[] = []

  if (!form.name.trim()) {
    errors.push("Nome da despesa é obrigatório")
  }

  if (form.value <= 0) {
    errors.push("Valor deve ser maior que zero")
  }

  if (!form.date) {
    errors.push("Data é obrigatória")
  }

  return errors
}

const safeParseFloat = (value: string): number => {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const FinancialDashboard = ({ onBack }: FinancialDashboardProps) => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    name: "",
    category: "manutenção",
    value: 0,
    date: new Date().toISOString().split("T")[0],
  })

  // Calculate today's data with error handling
  const todayData = useMemo(() => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const todayFinancial = mockFinancialData.find((d) => d.date === today) || mockFinancialData[0]
      const todayExpenses = expenses.filter((e) => e.date === today)
      const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + (e.value || 0), 0)

      return {
        ...todayFinancial,
        expenses: todayExpensesTotal,
        totalExpenses: todayExpensesTotal,
      }
    } catch (error) {
      console.error("Error calculating today's data:", error)
      return mockFinancialData[0]
    }
  }, [expenses])

  const monthlyChartData = useMemo(() => {
    try {
      return mockFinancialData.map((data) => ({
        date: new Date(data.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        ganhos: data.totalIncome || 0,
        gastos: data.totalExpenses || 0,
        media: ((data.totalIncome || 0) + (data.totalExpenses || 0)) / 2,
      }))
    } catch (error) {
      console.error("Error preparing monthly chart data:", error)
      return []
    }
  }, [])

  const categoryChartData = useMemo(() => {
    try {
      const categories: ExpenseCategory[] = ["manutenção", "transporte", "administrativo"]

      return categories.map((category) => {
        const categoryExpenses = expenses.filter((e) => e.category === category)
        return {
          category,
          value: categoryExpenses.reduce((sum, e) => sum + (e.value || 0), 0),
          count: categoryExpenses.length,
        }
      })
    } catch (error) {
      console.error("Error preparing category chart data:", error)
      return []
    }
  }, [expenses])

  const handleAddExpense = useCallback(async () => {
    try {
      setIsLoading(true)

      const validationErrors = validateExpenseForm(expenseForm)
      if (validationErrors.length > 0) {
        toast({
          title: "Erro de validação",
          description: validationErrors.join(", "),
          variant: "destructive",
        })
        return
      }

      const newExpense: Expense = {
        id: `EXP${String(expenses.length + 1).padStart(3, "0")}`,
        name: expenseForm.name.trim(),
        category: expenseForm.category,
        value: expenseForm.value,
        date: expenseForm.date,
        createdAt: new Date().toISOString(),
      }

      setExpenses((prevExpenses) => [...prevExpenses, newExpense])

      // Reset form
      setExpenseForm({
        name: "",
        category: "manutenção",
        value: 0,
        date: new Date().toISOString().split("T")[0],
      })

      setIsExpenseDialogOpen(false)

      toast({
        title: "Despesa adicionada",
        description: `Despesa "${newExpense.name}" foi registrada com sucesso.`,
      })
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a despesa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [expenseForm, expenses, toast])

  const handleExport = useCallback(
    async (format: "excel" | "pdf") => {
      try {
        setIsLoading(true)

        // Simulate export process
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Exportação iniciada",
          description: `Relatório em formato ${format.toUpperCase()} será baixado em breve.`,
        })

        console.log(`Exportando relatório em formato ${format}`)
        // TODO: Implement real export functionality
      } catch (error) {
        console.error("Error exporting report:", error)
        toast({
          title: "Erro na exportação",
          description: "Não foi possível exportar o relatório. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const updateExpenseForm = useCallback((field: keyof ExpenseFormData, value: string | number) => {
    setExpenseForm((prev) => ({
      ...prev,
      [field]: field === "value" ? (typeof value === "string" ? safeParseFloat(value) : value) : value,
    }))
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="sm" disabled={isLoading}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground text-balance">Dashboard Financeiro</h1>
            <p className="text-muted-foreground text-lg">Visão geral do fluxo de caixa e movimentações</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={() => setIsExpenseDialogOpen(true)} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Despesa
          </Button>
        </div>
      </div>

      {/* Cards de Resumo em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Fluxo de Caixa Diário</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Entradas
                </span>
                <span className="font-bold text-green-600">
                  R$ {((todayData.osClosedValue || 0) + (todayData.productsSoldValue || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Saídas
                </span>
                <span className="font-bold text-red-600">R$ {(todayData.expenses || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">OS Fechadas (Hoje)</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{todayData.osClosedCount || 0}</div>
            <p className="text-sm text-muted-foreground mb-2">R$ {(todayData.osClosedValue || 0).toFixed(2)}</p>
            <p className="text-xs text-green-600">Serviços concluídos</p>
          </CardContent>
        </Card>

        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Produtos Vendidos (Hoje)</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{todayData.productsSoldCount || 0}</div>
            <p className="text-sm text-muted-foreground mb-2">R$ {(todayData.productsSoldValue || 0).toFixed(2)}</p>
            <p className="text-xs text-blue-600">Itens vendidos</p>
          </CardContent>
        </Card>

        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Despesas Diversas</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">R$ {(todayData.expenses || 0).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mb-2">
              {expenses.filter((e) => e.date === todayData.date).length} lançamentos
            </p>
            <p className="text-xs text-red-600">Gastos do dia</p>
          </CardContent>
        </Card>
      </div>

      <FinancialCharts
        dailyData={{
          osClosedValue: todayData.osClosedValue || 0,
          productsSoldValue: todayData.productsSoldValue || 0,
          expenses: todayData.expenses || 0,
        }}
        monthlyData={monthlyChartData}
        categoryData={categoryChartData}
      />

      {/* Lista de Despesas Recentes */}
      <Card className="shadow-modern border-0 gradient-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-balance">Despesas Recentes</CardTitle>
          <CardDescription>Últimas despesas lançadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:shadow-md transition-all duration-200 hover:border-primary/20 bg-card/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Wrench className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{expense.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category} • {new Date(expense.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-red-600">R$ {(expense.value || 0).toFixed(2)}</p>
                  <Badge variant="outline" className="text-xs">
                    {expense.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Adicionar Despesa */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Despesa</DialogTitle>
            <DialogDescription>Registre uma nova despesa no sistema</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-name">Nome da Despesa</Label>
              <Input
                id="expense-name"
                value={expenseForm.name}
                onChange={(e) => updateExpenseForm("name", e.target.value)}
                placeholder="Ex: Compra de peça X"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-category">Categoria</Label>
              <Select
                value={expenseForm.category}
                onValueChange={(value: ExpenseCategory) => updateExpenseForm("category", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manutenção">Manutenção</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-value">Valor (R$)</Label>
              <Input
                id="expense-value"
                type="number"
                step="0.01"
                min="0"
                value={expenseForm.value || ""}
                onChange={(e) => updateExpenseForm("value", e.target.value)}
                placeholder="0,00"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-date">Data</Label>
              <Input
                id="expense-date"
                type="date"
                value={expenseForm.date}
                onChange={(e) => updateExpenseForm("date", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={!expenseForm.name.trim() || expenseForm.value <= 0 || isLoading}
            >
              {isLoading ? (
                <>Adicionando...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FinancialDashboard
