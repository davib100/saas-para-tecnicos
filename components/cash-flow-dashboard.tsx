"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Package, Calendar, Download, Filter } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data para gráficos
const cashFlowData = [
  { name: "Jan", entrada: 12000, saida: 8000 },
  { name: "Fev", entrada: 15000, saida: 9500 },
  { name: "Mar", entrada: 18000, saida: 11000 },
  { name: "Abr", entrada: 16000, saida: 10500 },
  { name: "Mai", entrada: 20000, saida: 12000 },
  { name: "Jun", entrada: 22000, saida: 13500 },
]

const dailyCashFlow = [
  { dia: "01", entrada: 850, saida: 320 },
  { dia: "02", entrada: 1200, saida: 450 },
  { dia: "03", entrada: 950, saida: 380 },
  { dia: "04", entrada: 1100, saida: 520 },
  { dia: "05", entrada: 1350, saida: 680 },
  { dia: "06", entrada: 980, saida: 420 },
  { dia: "07", entrada: 1450, saida: 750 },
]

const inventoryData = [
  { name: "Peças em Estoque", value: 234, color: "#164e63" },
  { name: "Peças Utilizadas", value: 89, color: "#a16207" },
  { name: "Peças Pendentes", value: 45, color: "#be123c" },
]

const recentTransactions = [
  { id: 1, tipo: "Entrada", descricao: "Pagamento OS #001", valor: 250.0, data: "2024-01-15" },
  { id: 2, tipo: "Saída", descricao: "Compra de peças", valor: -180.0, data: "2024-01-15" },
  { id: 3, tipo: "Entrada", descricao: "Pagamento OS #002", valor: 320.0, data: "2024-01-14" },
  { id: 4, tipo: "Saída", descricao: "Taxa de diagnóstico", valor: -60.0, data: "2024-01-14" },
  { id: 5, tipo: "Entrada", descricao: "Pagamento OS #003", valor: 150.0, data: "2024-01-13" },
]

interface CashFlowDashboardProps {
  onBack: () => void
}

function CashFlowDashboard({ onBack }: CashFlowDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("hoje")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Dashboard de Fluxo de Caixa</h1>
                <p className="text-muted-foreground">Acompanhe entradas e saídas em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Período
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entrada Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 1.450</div>
              <p className="text-xs text-muted-foreground">+15% em relação a ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saída Hoje</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ 750</div>
              <p className="text-xs text-muted-foreground">-8% em relação a ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Dia</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ 700</div>
              <p className="text-xs text-muted-foreground">Lucro líquido diário</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Movimentado</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Itens utilizados hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Fluxo de Caixa Diário */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa - Últimos 7 Dias</CardTitle>
              <CardDescription>Comparativo entre entradas e saídas diárias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyCashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`R$ ${value}`, ""]}
                    labelFormatter={(label) => `Dia ${label}`}
                  />
                  <Bar dataKey="entrada" fill="var(--chart-1)" name="Entrada" />
                  <Bar dataKey="saida" fill="var(--chart-2)" name="Saída" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentação de Estoque</CardTitle>
              <CardDescription>Distribuição atual do estoque de peças</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Tendência Mensal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tendência Mensal - Fluxo de Caixa</CardTitle>
            <CardDescription>Evolução das entradas e saídas nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`R$ ${value}`, ""]} />
                <Line type="monotone" dataKey="entrada" stroke="var(--chart-1)" strokeWidth={3} name="Entrada" />
                <Line type="monotone" dataKey="saida" stroke="var(--chart-2)" strokeWidth={3} name="Saída" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras e de estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.tipo === "Entrada" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.tipo === "Entrada" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.descricao}</p>
                      <p className="text-sm text-muted-foreground">{transaction.data}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.valor > 0 ? "text-green-600" : "text-red-600"}`}>
                      R$ {Math.abs(transaction.valor).toFixed(2)}
                    </p>
                    <Badge variant={transaction.tipo === "Entrada" ? "default" : "destructive"}>
                      {transaction.tipo}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CashFlowDashboard
