'use client'

import { useState, useMemo, useCallback, useEffect } from "react"
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

// Interfaces
interface FinancialData { date: string; osClosedCount: number; osClosedValue: number; productsSoldCount: number; productsSoldValue: number; expenses: number; totalIncome: number; totalExpenses: number; }
interface Expense { id: string; name: string; category: string; value: number; date: string; createdAt: string; }
type ExpenseCategory = "manutenção" | "transporte" | "administrativo";
interface FinancialDashboardProps { onBack: () => void; }
interface ExpenseFormData { name: string; category: ExpenseCategory; value: number; date: string; }

// Dados mock zerados para ambiente de produção
const mockFinancialData: FinancialData[] = []
const mockExpenses: Expense[] = []

// Funções utilitárias
const validateExpenseForm = (form: ExpenseFormData): string[] => {
  const errors: string[] = []
  if (!form.name.trim()) errors.push("Nome da despesa é obrigatório")
  if (form.value <= 0) errors.push("Valor deve ser maior que zero")
  if (!form.date) errors.push("Data é obrigatória")
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
  
  // Simula o carregamento inicial dos dados
  useEffect(() => {
      // Em um app real, aqui seria uma chamada de API para buscar as despesas
      setExpenses(mockExpenses)
  }, [])

  // --- CÁLCULOS MEMORIZADOS ---
  const todayData = useMemo(() => {
      const today = new Date().toISOString().split("T")[0];
      const todayFinancial = mockFinancialData.find(d => d.date === today) || { osClosedCount: 0, osClosedValue: 0, productsSoldCount: 0, productsSoldValue: 0, expenses: 0, totalIncome: 0, totalExpenses: 0 };
      const todayExpensesTotal = expenses.filter(e => e.date === today).reduce((sum, e) => sum + (e.value || 0), 0);
      return { ...todayFinancial, date: today, expenses: todayExpensesTotal, totalExpenses: todayExpensesTotal };
  }, [expenses]);

  const monthlyChartData = useMemo(() => {
    return mockFinancialData.map((data) => ({
      date: new Date(data.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      ganhos: data.totalIncome || 0,
      gastos: data.totalExpenses || 0,
      media: ((data.totalIncome || 0) + (data.totalExpenses || 0)) / 2,
    }))
  }, [])

  const categoryChartData = useMemo(() => {
    const categories: ExpenseCategory[] = ["manutenção", "transporte", "administrativo"];
    return categories.map((category) => {
      const categoryExpenses = expenses.filter((e) => e.category === category)
      return { category, value: categoryExpenses.reduce((sum, e) => sum + (e.value || 0), 0), count: categoryExpenses.length };
    })
  }, [expenses])

  // --- FUNÇÕES DE CALLBACK OTIMIZADAS ---

  // useCallback foi removido pois não é necessário e causava o loop de renderização.
  const handleAddExpense = async () => {
    const validationErrors = validateExpenseForm(expenseForm)
    if (validationErrors.length > 0) {
      toast({ title: "Erro de validação", description: validationErrors.join(", "), variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newExpense: Expense = {
        id: `EXP${Date.now()}`,
        name: expenseForm.name.trim(),
        category: expenseForm.category,
        value: expenseForm.value,
        date: expenseForm.date,
        createdAt: new Date().toISOString(),
      }

      setExpenses(prevExpenses => [...prevExpenses, newExpense])

      setExpenseForm({ name: "", category: "manutenção", value: 0, date: new Date().toISOString().split("T")[0] })
      setIsExpenseDialogOpen(false)
      toast({ title: "Despesa adicionada", description: `"${newExpense.name}" foi registrada.` })

    } catch (error) {
      console.error("Error adding expense:", error)
      toast({ title: "Erro", description: "Não foi possível adicionar a despesa.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // useCallback foi removido.
  const handleExport = async (format: "excel" | "pdf") => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast({ title: "Exportação iniciada", description: `Relatório em ${format.toUpperCase()} será baixado.` })
      } catch (error) {
        console.error("Error exporting report:", error)
        toast({ title: "Erro na exportação", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
  }

  const updateExpenseForm = useCallback((field: keyof ExpenseFormData, value: string | number) => {
    setExpenseForm(prev => ({ ...prev, [field]: field === "value" ? (typeof value === "string" ? safeParseFloat(value) : value) : value }))
  }, [])
  
  // --- RENDERIZAÇÃO DO COMPONENTE ---

  const EmptyState = () => (
      <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg text-muted-foreground">
          <Wrench className="mx-auto h-10 w-10 mb-4" />
          <h3 className="text-lg font-semibold">Nenhuma Despesa Registrada</h3>
          <p className="text-sm">Comece adicionando uma despesa para vê-la aqui.</p>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="sm" disabled={isLoading}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
            <p className="text-muted-foreground">Visão geral do fluxo de caixa e movimentações</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={isLoading}><Download className="w-4 h-4 mr-2" />Excel</Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={isLoading}><Download className="w-4 h-4 mr-2" />PDF</Button>
          <Button onClick={() => setIsExpenseDialogOpen(true)} disabled={isLoading}><Plus className="w-4 h-4 mr-2" />Adicionar Despesa</Button>
        </div>
      </div>

      {/* Grid de Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cards aqui... */}
      </div>

      <FinancialCharts
        dailyData={{ osClosedValue: todayData.osClosedValue, productsSoldValue: todayData.productsSoldValue, expenses: todayData.expenses }}
        monthlyData={monthlyChartData}
        categoryData={categoryChartData}
      />

      <Card className="shadow-modern border-0 gradient-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Despesas Recentes</CardTitle>
          <CardDescription>Últimas despesas lançadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-xl bg-card/50">
                  <div>
                      <p className="font-medium">{expense.name}</p>
                      <p className="text-sm text-muted-foreground">{expense.category}</p>
                  </div>
                  <p className="font-bold text-lg text-red-600">R$ {expense.value.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      {/* Modal de Adicionar Despesa */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
             {/* Conteúdo do modal... */}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FinancialDashboard
