"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Calendar, DollarSign, Tag, FileText } from "lucide-react"
import { useRealtimeContext } from "@/components/realtime-provider"
import { toast } from "sonner"

interface Expense {
  id: string
  name: string
  category: string
  value: number
  date: string
  description?: string
  createdAt: string
  updatedAt: string
}

const mockExpenses: Expense[] = [
  {
    id: "EXP001",
    name: "Compra de peças para estoque",
    category: "manutenção",
    value: 150.0,
    date: "2024-01-15",
    description: "Compra de fontes universais e cabos HDMI para estoque",
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
  },
  {
    id: "EXP002",
    name: "Combustível para entrega",
    category: "transporte",
    value: 80.0,
    date: "2024-01-15",
    description: "Abastecimento do veículo para entregas de equipamentos",
    createdAt: "2024-01-15T14:20:00",
    updatedAt: "2024-01-15T14:20:00",
  },
  {
    id: "EXP003",
    name: "Material de escritório",
    category: "administrativo",
    value: 90.0,
    date: "2024-01-14",
    description: "Compra de papel A4, canetas e etiquetas",
    createdAt: "2024-01-14T16:45:00",
    updatedAt: "2024-01-14T16:45:00",
  },
  {
    id: "EXP004",
    name: "Manutenção de equipamentos",
    category: "manutenção",
    value: 200.0,
    date: "2024-01-13",
    description: "Calibração de multímetros e limpeza de estação de solda",
    createdAt: "2024-01-13T09:15:00",
    updatedAt: "2024-01-13T09:15:00",
  },
  {
    id: "EXP005",
    name: "Taxa de cartão de crédito",
    category: "administrativo",
    value: 45.0,
    date: "2024-01-12",
    description: "Taxa mensal do cartão de crédito empresarial",
    createdAt: "2024-01-12T08:00:00",
    updatedAt: "2024-01-12T08:00:00",
  },
]

const categories = [
  { value: "manutenção", label: "Manutenção", color: "bg-blue-100 text-blue-800" },
  { value: "transporte", label: "Transporte", color: "bg-green-100 text-green-800" },
  { value: "administrativo", label: "Administrativo", color: "bg-purple-100 text-purple-800" },
  { value: "marketing", label: "Marketing", color: "bg-pink-100 text-pink-800" },
  { value: "outros", label: "Outros", color: "bg-gray-100 text-gray-800" },
]

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { emit } = useRealtimeContext()

  const [formData, setFormData] = useState({
    name: "",
    category: "manutenção",
    value: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  })

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const getCategoryInfo = (category: string) => {
    return categories.find((cat) => cat.value === category) || categories[categories.length - 1]
  }

  const calculateTotals = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.value, 0)
    const byCategory = categories.reduce(
      (acc, category) => {
        acc[category.value] = expenses
          .filter((expense) => expense.category === category.value)
          .reduce((sum, expense) => sum + expense.value, 0)
        return acc
      },
      {} as Record<string, number>,
    )

    return { total, byCategory }
  }

  const totals = calculateTotals()

  const handleSaveExpense = () => {
    if (!formData.name || formData.value <= 0) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    const now = new Date().toISOString()

    if (editingExpense) {
      const updatedExpense: Expense = {
        ...editingExpense,
        ...formData,
        updatedAt: now,
      }

      setExpenses(expenses.map((expense) => (expense.id === editingExpense.id ? updatedExpense : expense)))

      emit("expenses:update", updatedExpense)
      toast.success("Despesa atualizada com sucesso")
    } else {
      const newExpense: Expense = {
        id: `EXP${String(expenses.length + 1).padStart(3, "0")}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      }

      setExpenses([newExpense, ...expenses])
      emit("expenses:create", newExpense)
      toast.success("Despesa adicionada com sucesso")
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      name: expense.name,
      category: expense.category,
      value: expense.value,
      date: expense.date,
      description: expense.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== expenseId))
    emit("expenses:delete", { id: expenseId })
    toast.success("Despesa removida com sucesso")
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "manutenção",
      value: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
    })
    setEditingExpense(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Despesas</h1>
          <p className="text-muted-foreground">Controle todas as despesas da sua empresa</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total de Despesas</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">R$ {totals.total.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">{expenses.length} despesas registradas</p>
          </CardContent>
        </Card>

        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Manutenção</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              R$ {totals.byCategory.manutenção?.toFixed(2) || "0.00"}
            </div>
            <p className="text-sm text-muted-foreground">
              {expenses.filter((e) => e.category === "manutenção").length} despesas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Transporte</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              R$ {totals.byCategory.transporte?.toFixed(2) || "0.00"}
            </div>
            <p className="text-sm text-muted-foreground">
              {expenses.filter((e) => e.category === "transporte").length} despesas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-modern hover:shadow-modern-xl transition-all duration-300 hover:-translate-y-1 border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Administrativo</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              R$ {totals.byCategory.administrativo?.toFixed(2) || "0.00"}
            </div>
            <p className="text-sm text-muted-foreground">
              {expenses.filter((e) => e.category === "administrativo").length} despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, descrição ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas Registradas ({filteredExpenses.length})</CardTitle>
          <CardDescription>Lista de todas as despesas do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category)
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-6 border border-border/50 rounded-xl hover:shadow-md transition-all duration-200 hover:border-primary/20 bg-card/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-6">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground text-lg">{expense.id}</p>
                          <Badge className={`${categoryInfo.color} font-medium px-2 py-1`}>{categoryInfo.label}</Badge>
                        </div>
                        <p className="font-medium text-foreground">{expense.name}</p>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground text-pretty">{expense.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(expense.date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(expense.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-2xl text-red-600">R$ {expense.value.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditExpense(expense)}
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Adicionar/Editar Despesa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
            <DialogDescription>
              {editingExpense ? "Edite as informações da despesa" : "Registre uma nova despesa no sistema"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-name">Nome da Despesa *</Label>
              <Input
                id="expense-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Compra de peça X"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-category">Categoria *</Label>
              <select
                id="expense-category"
                className="w-full p-2 border rounded-md"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-value">Valor (R$) *</Label>
              <Input
                id="expense-value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-date">Data *</Label>
              <Input
                id="expense-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-description">Descrição</Label>
              <Textarea
                id="expense-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada da despesa (opcional)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveExpense} disabled={!formData.name || formData.value <= 0}>
              {editingExpense ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Atualizar
                </>
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
