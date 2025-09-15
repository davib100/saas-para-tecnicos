'use client'

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardList, DollarSign, TrendingUp, BarChart3, Plus, Eye, Activity, Users, Package, AlertTriangle } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"

// --- COMPONENTES DE ESQUELETO (LOADING) ---

// Esqueleto para a tela de Clientes
const ClientManagementSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <Card><CardContent className="pt-6"><Skeleton className="h-10 w-full" /></CardContent></Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// Esqueleto para a tela de Produtos
const ProductManagementSkeleton = () => (
    <div className="p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-8 w-72 mb-2" />
                <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex gap-4 border-b"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div>
        <Card><CardContent className="pt-6"><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card>
            <CardHeader><Skeleton className="h-7 w-56" /></CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                        </div>
                        <div className="flex items-center gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);

// Esqueleto para a tela de Ordens de Serviço
const OrderManagementSkeleton = () => (
    <div className="p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <Card><CardContent className="pt-6"><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
                 {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);

// Fallback genérico para outros componentes
const GenericSkeleton = () => (
    <div className="p-6 animate-pulse"><Card><CardHeader><Skeleton className="h-8 w-64"/></CardHeader><CardContent><Skeleton className="h-40 w-full"/></CardContent></Card></div>
)


// --- IMPORTAÇÕES DINÂMICAS COM ESQUELETOS ESPECÍFICOS ---

const ClientManagement = dynamic(() => import("@/components/client-management").then(m => ({ default: m.ClientManagement })), { ssr: false, loading: () => <ClientManagementSkeleton /> })
const ProductManagement = dynamic(() => import("@/components/product-management").then(m => ({ default: m.ProductManagement })), { ssr: false, loading: () => <ProductManagementSkeleton /> })
const OrderManagement = dynamic(() => import("@/components/order-management").then(m => ({ default: m.OrderManagement })), { ssr: false, loading: () => <OrderManagementSkeleton /> })

// Componentes que não precisam de esqueleto customizado por enquanto
const CashFlowDashboard = dynamic(() => import("@/components/cash-flow-dashboard").then(m => ({ default: m.CashFlowDashboard })), { ssr: false, loading: () => <GenericSkeleton /> })
const FinancialDashboard = dynamic(() => import("@/components/financial-dashboard").then(m => ({ default: m.FinancialDashboard })), { ssr: false, loading: () => <GenericSkeleton /> })
const FinancialModule = dynamic(() => import("@/components/financial-module"), { ssr: false, loading: () => <GenericSkeleton /> })
const ReportsModule = dynamic(() => import("@/components/reports-module").then(m => ({ default: m.ReportsModule })), { ssr: false, loading: () => <GenericSkeleton /> })
const SettingsModule = dynamic(() => import("@/components/settings-module").then(m => ({ default: m.SettingsModule })), { ssr: false, loading: () => <GenericSkeleton /> })
const ExpenseManagement = dynamic(() => import("@/components/expense-management").then(m => ({ default: m.ExpenseManagement })), { ssr: false, loading: () => <GenericSkeleton /> })


interface Order {
  id: string; cliente: string; equipamento: string; status: string; valor: number; data: string; problema: string;
}

const mockOrders: Order[] = [] // Mantido vazio

const getStatusBadgeClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    "Entrada": "bg-blue-100 text-blue-800", "Em análise": "bg-yellow-100 text-yellow-800",
    "Aguardando aprovação": "bg-orange-100 text-orange-800", "Em execução": "bg-purple-100 text-purple-800",
    "Concluído": "bg-green-100 text-green-800", "Cancelado": "bg-red-100 text-red-800",
  }
  return statusMap[status] || "bg-gray-100 text-gray-800"
}

export default function HomePage() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view)
    if (window.innerWidth < 768) { setIsSidebarOpen(false); }
  }, [])

  const dashboardStats = useMemo(
    () => ({ osAndamento: 0, osConcluidas: 0, orcamentosPendentes: 0, receitaMensal: 0, clientesAtivos: 0, produtosCadastrados: 0, taxaSucesso: 0 }), []
  )

  const recentOrders = useMemo(() => mockOrders.slice(0, 3), [])

  const renderCurrentView = () => {
    const viewMap: { [key: string]: React.ReactNode } = {
        dashboard: renderDashboard(),
        clients: <ClientManagement />,
        products: <ProductManagement />,
        orders: <OrderManagement />,
        cashflow: <CashFlowDashboard onBack={() => setCurrentView("dashboard")} />,
        financial: <FinancialDashboard onBack={() => setCurrentView("dashboard")} />,
        expenses: <ExpenseManagement />,
        reports: <ReportsModule />,
        settings: <SettingsModule />,
    };
    return viewMap[currentView] || renderDashboard()
  };

  const EmptyRecentOrders = () => (
    <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">Nenhuma Ordem de Serviço Recente</h3>
        <p className="mt-2 text-sm">Quando novas ordens de serviço forem criadas, elas aparecerão aqui.</p>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 sm:space-y-8 p-4 md:p-6 lg:p-8 animate-fade-in">
      <header className="relative overflow-hidden rounded-lg sm:rounded-xl bg-primary text-primary-foreground p-6 sm:p-8">
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">Dashboard</h1>
                    <p className="text-primary-foreground/80">Visão geral e rápida do seu negócio.</p>
                </div>
                <div className="flex items-center gap-2">
                     <Button onClick={() => handleViewChange("orders")} size="sm"><Plus className="w-4 h-4 mr-2" /> Nova OS</Button>
                </div>
            </div>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:border-primary/50 transition-colors"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">OS em Andamento</CardTitle><Activity className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardStats.osAndamento}</div></CardContent></Card>
        <Card className="hover:border-primary/50 transition-colors"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">OS Concluídas</CardTitle><ClipboardList className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardStats.osConcluidas}</div><p className="text-xs text-muted-foreground">neste mês</p></CardContent></Card>
        <Card className="hover:border-primary/50 transition-colors"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Orçamentos</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardStats.orcamentosPendentes}</div><p className="text-xs text-muted-foreground">pendentes</p></CardContent></Card>
        <Card className="hover:border-primary/50 transition-colors"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Receita Mensal</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">R$ {dashboardStats.receitaMensal.toLocaleString("pt-BR")}</div></CardContent></Card>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ordens de Serviço Recentes</CardTitle>
            <CardDescription>Últimas OS cadastradas no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
             {recentOrders.length > 0 ? (
                <div className="space-y-4">
                {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                    <div className="min-w-0"><p className="font-semibold truncate">{order.equipamento}</p><p className="text-sm text-muted-foreground">{order.cliente}</p></div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className={getStatusBadgeClass(order.status)}>{order.status}</Badge>
                        <span className="font-medium min-w-fit">R$ {order.valor.toFixed(2)}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleViewChange("orders")}><Eye className="w-4 h-4" /></Button>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <EmptyRecentOrders />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Atalhos Rápidos</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex-col h-20" onClick={() => handleViewChange('clients')}><Users className="w-5 h-5 mb-1"/>Clientes</Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => handleViewChange('products')}><Package className="w-5 h-5 mb-1"/>Produtos</Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => handleViewChange('reports')}><BarChart3 className="w-5 h-5 mb-1"/>Relatórios</Button>
            <Button variant="outline" className="flex-col h-20" onClick={() => handleViewChange('settings')}><Activity className="w-5 h-5 mb-1"/>Config.</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex md:flex-shrink-0">
        <SidebarNavigation currentView={currentView} onViewChange={handleViewChange} isMobile={false} />
      </div>
      <div className="flex flex-col flex-1 w-full">
        <header className="md:hidden flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-semibold">Sistema OS</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Activity className="w-5 h-5" /></Button>
        </header>
        {isSidebarOpen && (
            <div className="md:hidden"><SidebarNavigation currentView={currentView} onViewChange={handleViewChange} isMobile={true} /></div>
        )}
        <main className="flex-1 overflow-y-auto">{renderCurrentView()}</main>
      </div>
    </div>
  );
}
