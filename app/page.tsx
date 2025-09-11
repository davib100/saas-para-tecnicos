"use client"

import { useState, useMemo, useCallback, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardList, DollarSign, TrendingUp, BarChart3, Plus, Eye, Activity, Users, Package } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"

const CashFlowDashboard = lazy(() =>
  import("@/components/cash-flow-dashboard")
    .then((module) => ({ default: module.CashFlowDashboard }))
    .catch(() => ({ default: () => <div>Erro ao carregar dashboard de fluxo de caixa</div> })),
)

const FinancialDashboard = lazy(() =>
  import("@/components/financial-dashboard")
    .then((module) => ({ default: module.FinancialDashboard }))
    .catch(() => ({ default: () => <div>Erro ao carregar dashboard financeiro</div> })),
)

const ClientManagement = lazy(() =>
  import("@/components/client-management")
    .then((module) => ({ default: module.ClientManagement }))
    .catch(() => ({
      default: () => <div>Erro ao carregar gerenciamento de clientes</div>,
    })),
)

const ProductManagement = lazy(() =>
  import("@/components/product-management")
    .then((module) => ({ default: module.ProductManagement }))
    .catch(() => ({
      default: () => <div>Erro ao carregar gerenciamento de produtos</div>,
    })),
)

const OrderManagement = lazy(() =>
  import("@/components/order-management")
    .then((module) => ({ default: module.OrderManagement }))
    .catch(() => ({
      default: () => <div>Erro ao carregar gerenciamento de ordens</div>,
    })),
)

const FinancialModule = lazy(() =>
  import("@/components/financial-module")
    .then((module) => ({ default: module.default }))
    .catch(() => ({ default: () => <div>Erro ao carregar módulo financeiro</div> })),
)

const ReportsModule = lazy(() =>
  import("@/components/reports-module")
    .then((module) => ({ default: module.ReportsModule }))
    .catch(() => ({ default: () => <div>Erro ao carregar módulo de relatórios</div> })),
)

const SettingsModule = lazy(() =>
  import("@/components/settings-module")
    .then((module) => ({ default: module.SettingsModule }))
    .catch(() => ({ default: () => <div>Erro ao carregar configurações</div> })),
)

const ExpenseManagement = lazy(() =>
  import("@/components/expense-management")
    .then((module) => ({ default: module.ExpenseManagement }))
    .catch(() => ({ default: () => <div>Erro ao carregar gerenciamento de despesas</div> })),
)

interface Order {
  id: string
  cliente: string
  equipamento: string
  status: string
  valor: number
  data: string
  problema: string
}

const mockOrders: Order[] = [
  {
    id: "OS001",
    cliente: "João Silva",
    equipamento: "Notebook Dell Inspiron",
    status: "Em análise",
    valor: 250.0,
    data: "2024-01-15",
    problema: "Não liga, possível problema na fonte",
  },
  {
    id: "OS002",
    cliente: "Maria Santos",
    equipamento: "iPhone 12",
    status: "Aguardando aprovação",
    valor: 180.0,
    data: "2024-01-14",
    problema: "Tela trincada, touch não funciona",
  },
  {
    id: "OS003",
    cliente: "Pedro Costa",
    equipamento: 'TV Samsung 55"',
    status: "Em execução",
    valor: 320.0,
    data: "2024-01-13",
    problema: "Sem imagem, apenas áudio",
  },
  {
    id: "OS004",
    cliente: "Ana Oliveira",
    equipamento: "Notebook HP",
    status: "Concluído",
    valor: 150.0,
    data: "2024-01-12",
    problema: "Limpeza e troca de pasta térmica",
  },
]

const getStatusBadgeClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    Entrada: "status-entrada",
    "Em análise": "status-analise",
    "Aguardando aprovação": "status-aprovacao",
    "Em execução": "status-execucao",
    Concluído: "status-concluido",
    Cancelado: "status-cancelado",
  }

  return statusMap[status] || "status-entrada"
}

const ComponentLoader = () => (
  <div className="space-y-6 p-4 sm:p-6 lg:p-8" role="status" aria-label="Carregando conteúdo">
    <div className="space-y-2">
      <Skeleton className="h-6 sm:h-8 w-[150px] sm:w-[200px]" />
      <Skeleton className="h-3 sm:h-4 w-[200px] sm:w-[300px]" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4 sm:p-6">
          <Skeleton className="h-3 sm:h-4 w-[80px] sm:w-[100px] mb-2 sm:mb-4" />
          <Skeleton className="h-6 sm:h-8 w-[40px] sm:w-[60px] mb-1 sm:mb-2" />
          <Skeleton className="h-2 sm:h-3 w-[60px] sm:w-[80px]" />
        </Card>
      ))}
    </div>
  </div>
)

export default function HomePage() {
  const [currentView, setCurrentView] = useState("dashboard")

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view)
  }, [])

  const dashboardStats = useMemo(
    () => ({
      osAndamento: 23,
      osConcluidas: 104,
      orcamentosPendentes: 8,
      receitaMensal: 6240,
      clientesAtivos: 247,
      produtosCadastrados: 89,
      taxaSucesso: 94.2,
    }),
    [],
  )

  const recentOrders = useMemo(() => mockOrders.slice(0, 3), [])

  const renderCurrentView = () => {
    switch (currentView) {
      case "cashflow":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <CashFlowDashboard onBack={() => setCurrentView("dashboard")} />
          </Suspense>
        )
      case "financial":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <FinancialDashboard onBack={() => setCurrentView("dashboard")} />
          </Suspense>
        )
      case "expenses":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ExpenseManagement />
          </Suspense>
        )
      case "clients":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ClientManagement />
          </Suspense>
        )
      case "products":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ProductManagement />
          </Suspense>
        )
      case "orders":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <OrderManagement />
          </Suspense>
        )
      case "reports":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ReportsModule />
          </Suspense>
        )
      case "settings":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <SettingsModule />
          </Suspense>
        )
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <header className="relative overflow-hidden rounded-xl sm:rounded-2xl gradient-primary p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-balance">Dashboard</h1>
              <p className="text-primary-foreground/80 text-base sm:text-lg">Visão geral do seu negócio</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                onClick={() => handleViewChange("cashflow")}
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs sm:text-sm"
                aria-label="Abrir dashboard financeiro"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard </span>Financeiro
              </Button>
              <Button
                onClick={() => handleViewChange("expenses")}
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs sm:text-sm"
                aria-label="Gerenciar despesas"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Gerenciar </span>Despesas
              </Button>
              <Button
                onClick={() => handleViewChange("orders")}
                size="sm"
                className="bg-white text-primary hover:bg-white/90 text-xs sm:text-sm"
                aria-label="Criar nova ordem de serviço"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova OS
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-white/20 -translate-y-16 sm:-translate-y-32 translate-x-16 sm:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 rounded-full bg-white/10 translate-y-12 sm:translate-y-24 -translate-x-12 sm:-translate-x-24"></div>
        </div>
      </header>

      {/* Stats Grid */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        aria-label="Estatísticas do dashboard"
      >
        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-semibold text-muted-foreground">OS em Andamento</CardTitle>
            <div className="stat-card-icon bg-primary/10">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">{dashboardStats.osAndamento}</div>
            <p className="stat-card-description">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-600" />
              +3 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-semibold text-muted-foreground">OS Concluídas</CardTitle>
            <div className="stat-card-icon bg-green-500/10">
              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">{dashboardStats.osConcluidas}</div>
            <p className="text-sm text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Orçamentos Pendentes</CardTitle>
            <div className="stat-card-icon bg-orange-500/10">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">{dashboardStats.orcamentosPendentes}</div>
            <p className="text-sm text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-card-header">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Receita Mensal</CardTitle>
            <div className="stat-card-icon bg-blue-500/10">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-card-value">R$ {dashboardStats.receitaMensal.toLocaleString("pt-BR")}</div>
            <p className="stat-card-description">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-600" />
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recent Orders */}
      <section aria-label="Ordens de serviço recentes">
        <Card className="shadow-modern border-0 gradient-card animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-balance">Ordens de Serviço Recentes</CardTitle>
                <CardDescription className="text-muted-foreground text-sm sm:text-base">
                  Últimas OS cadastradas no sistema
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => handleViewChange("orders")}
                className="hover:bg-primary hover:text-primary-foreground transition-colors w-full sm:w-auto"
                size="sm"
                aria-label="Ver todas as ordens de serviço"
              >
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {recentOrders.map((order, index) => (
                <article key={order.id} className="order-item" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="order-item-content">
                    <div className="order-item-info">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-base sm:text-lg">{order.id}</p>
                        <p className="text-muted-foreground text-sm sm:text-base">{order.cliente}</p>
                      </div>
                      <div className="order-item-details">
                        <p className="font-medium text-foreground text-sm sm:text-base">{order.equipamento}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground text-pretty">{order.problema}</p>
                      </div>
                    </div>
                  </div>
                  <div className="order-item-actions">
                    <Badge className={`status-badge ${getStatusBadgeClass(order.status)}`}>{order.status}</Badge>
                    <p className="font-bold text-base sm:text-lg text-foreground min-w-fit">
                      R$ {order.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                      aria-label={`Ver detalhes da ordem ${order.id}`}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Additional Stats */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up"
        aria-label="Estatísticas adicionais"
      >
        <Card className="shadow-modern border-0 gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Clientes Ativos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{dashboardStats.clientesAtivos}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">+18 este mês</p>
          </CardContent>
        </Card>

        <Card className="shadow-modern border-0 gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Produtos Cadastrados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{dashboardStats.produtosCadastrados}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Diferentes categorias</p>
          </CardContent>
        </Card>

        <Card className="shadow-modern border-0 gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <CardTitle className="text-base sm:text-lg">Taxa de Sucesso</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{dashboardStats.taxaSucesso}%</div>
            <p className="text-xs sm:text-sm text-muted-foreground">OS concluídas com sucesso</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )

  return (
    <div className="dashboard-container">
      <SidebarNavigation currentView={currentView} onViewChange={handleViewChange} />
      <div className="dashboard-content">{renderCurrentView()}</div>
    </div>
  )
}
