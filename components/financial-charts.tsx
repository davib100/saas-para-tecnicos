"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart3, PieChartIcon, Calendar, Download } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"

interface FinancialChartsProps {
  dailyData: {
    osClosedValue: number
    productsSoldValue: number
    expenses: number
  }
  monthlyData: Array<{
    date: string
    ganhos: number
    gastos: number
    media: number
  }>
  categoryData: Array<{
    category: string
    value: number
    count: number
  }>
}

const COLORS = {
  primary: "#10b981",
  secondary: "#059669",
  danger: "#dc2626",
  warning: "#f59e0b",
  info: "#6366f1",
  success: "#10b981",
}

export function FinancialCharts({ dailyData, monthlyData, categoryData }: FinancialChartsProps) {
  // Pie chart data for daily breakdown
  const pieChartData = [
    {
      name: "OS Fechadas",
      value: dailyData.osClosedValue,
      color: COLORS.primary,
      percentage: (
        (dailyData.osClosedValue / (dailyData.osClosedValue + dailyData.productsSoldValue + dailyData.expenses)) *
        100
      ).toFixed(1),
    },
    {
      name: "Produtos Vendidos",
      value: dailyData.productsSoldValue,
      color: COLORS.secondary,
      percentage: (
        (dailyData.productsSoldValue / (dailyData.osClosedValue + dailyData.productsSoldValue + dailyData.expenses)) *
        100
      ).toFixed(1),
    },
    {
      name: "Despesas Diversas",
      value: dailyData.expenses,
      color: COLORS.danger,
      percentage: (
        (dailyData.expenses / (dailyData.osClosedValue + dailyData.productsSoldValue + dailyData.expenses)) *
        100
      ).toFixed(1),
    },
  ]

  // Bar chart data for category expenses
  const barChartData = categoryData.map((item) => ({
    category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    valor: item.value,
    quantidade: item.count,
  }))

  // Area chart data for cash flow trend
  const areaChartData = monthlyData.map((item) => ({
    ...item,
    saldo: item.ganhos - item.gastos,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: R$ {Number(entry.value).toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            R$ {Number(data.value).toFixed(2)} ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza Diário */}
        <Card className="shadow-modern border-0 gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-balance">Distribuição Diária</CardTitle>
                  <CardDescription>Entradas x Saídas por categoria</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda personalizada */}
            <div className="mt-4 space-y-2">
              {pieChartData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ {entry.value.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{entry.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Evolução Mensal */}
        <Card className="shadow-modern border-0 gradient-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-balance">Evolução Mensal</CardTitle>
                  <CardDescription>Ganhos, gastos e média por dia</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Período
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ganhos"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    name="Ganhos Totais"
                    dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gastos"
                    stroke={COLORS.danger}
                    strokeWidth={3}
                    name="Gastos Totais"
                    dot={{ fill: COLORS.danger, strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="media"
                    stroke={COLORS.info}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Média"
                    dot={{ fill: COLORS.info, strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Barras - Despesas por Categoria */}
        <Card className="shadow-modern border-0 gradient-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-balance">Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição dos gastos por tipo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="valor" fill={COLORS.warning} name="Valor Total" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Área - Fluxo de Caixa */}
        <Card className="shadow-modern border-0 gradient-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-info" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-balance">Fluxo de Caixa</CardTitle>
                <CardDescription>Saldo líquido ao longo do tempo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="saldo"
                    stroke={COLORS.info}
                    fill={COLORS.info}
                    fillOpacity={0.3}
                    name="Saldo Líquido"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Indicadores de Performance */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-muted-foreground">Maior Saldo</span>
                </div>
                <p className="text-sm font-bold text-green-600">
                  R$ {Math.max(...areaChartData.map((d) => d.saldo)).toFixed(2)}
                </p>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-muted-foreground">Menor Saldo</span>
                </div>
                <p className="text-sm font-bold text-red-600">
                  R$ {Math.min(...areaChartData.map((d) => d.saldo)).toFixed(2)}
                </p>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-muted-foreground">Saldo Médio</span>
                </div>
                <p className="text-sm font-bold text-blue-600">
                  R$ {(areaChartData.reduce((sum, d) => sum + d.saldo, 0) / areaChartData.length).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Estatístico */}
      <Card className="shadow-modern border-0 gradient-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-balance">Resumo Estatístico</CardTitle>
          <CardDescription>Principais indicadores financeiros do período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">Total de Entradas</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {(dailyData.osClosedValue + dailyData.productsSoldValue).toFixed(2)}
              </p>
              <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                +15% vs período anterior
              </Badge>
            </div>

            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-400">Total de Saídas</span>
              </div>
              <p className="text-2xl font-bold text-red-600">R$ {dailyData.expenses.toFixed(2)}</p>
              <Badge variant="outline" className="mt-2 text-red-600 border-red-600">
                -8% vs período anterior
              </Badge>
            </div>

            <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-400">Saldo Líquido</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                R$ {(dailyData.osClosedValue + dailyData.productsSoldValue - dailyData.expenses).toFixed(2)}
              </p>
              <Badge variant="outline" className="mt-2 text-blue-600 border-blue-600">
                Positivo
              </Badge>
            </div>

            <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PieChartIcon className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-400">Margem de Lucro</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {(
                  ((dailyData.osClosedValue + dailyData.productsSoldValue - dailyData.expenses) /
                    (dailyData.osClosedValue + dailyData.productsSoldValue)) *
                  100
                ).toFixed(1)}
                %
              </p>
              <Badge variant="outline" className="mt-2 text-purple-600 border-purple-600">
                Saudável
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
