'use client'

import { useState, useCallback, useEffect, memo } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Plus,  Eye, 
  Activity, 
  AlertTriangle, 
  Menu, 
  Settings,
  Home, 
  Loader2 
} from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { CompanySetupModal } from "@/components/company-setup-modal"

// Componentes de Esqueleto e Módulos Dinâmicos
const PageSkeleton = () => ( <div className="space-y-6 p-4 md:p-6 lg:p-8"><div className="flex items-center justify-between"><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-80" /></div><Skeleton className="h-10 w-24" /></div><Card><CardContent className="pt-6"><Skeleton className="h-10 w-full" /></CardContent></Card><Card><CardContent className="pt-6 space-y-4">{[...Array(5)].map((_, i) => (<div key={i} className="flex items-center justify-between p-4 border rounded-lg"><div className="flex-1 space-y-2"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-4 w-1/2" /></div><div className="flex items-center gap-4"><Skeleton className="h-6 w-24" /><Skeleton className="h-8 w-8" /></div></div>))}</CardContent></Card></div> );
const ClientManagement = dynamic(() => import("@/components/client-management"), { loading: () => <PageSkeleton /> })
const ProductManagement = dynamic(() => import("@/components/product-management"), { loading: () => <PageSkeleton /> })
const OrderManagement = dynamic(() => import("@/components/order-management"), { loading: () => <PageSkeleton /> })
const FinancialModule = dynamic(() => import("@/components/financial-module"), { loading: () => <PageSkeleton /> })
const ReportsModule = dynamic(() => import("@/components/reports-module"), { loading: () => <PageSkeleton /> })
const SettingsModule = dynamic(() => import("@/components/settings-module"), { loading: () => <PageSkeleton /> })

// Interfaces, Constantes e Funções Puras
interface Order { id: string; client: { nome: string; } | null; equipment: string; status: string; }
interface DashboardStats { osAndamento: number; osConcluidas: number; orcamentosPendentes: number; receitaMensal: number; }
interface CompanyInfo { id: string; [key: string]: any; }

const STATUS_BADGE_CLASSES: Record<string, string> = { "Concluído": "bg-green-100 text-green-800", "Em Execução": "bg-purple-100 text-purple-800", "Aguardando Aprovação": "bg-yellow-100 text-yellow-800", "Cancelado": "bg-red-100 text-red-800", "Rascunho": "bg-gray-200 text-gray-800", "Orçamento Gerado": "bg-blue-100 text-blue-800" };
const DASHBOARD_CARDS = [ { key: 'osAndamento' as keyof DashboardStats, label: 'OS em Andamento', icon: Activity }, { key: 'osConcluidas' as keyof DashboardStats, label: 'OS Concluídas no Mês', icon: ClipboardList }, { key: 'orcamentosPendentes' as keyof DashboardStats, label: 'Orçamentos Pendentes', icon: DollarSign }, { key: 'receitaMensal' as keyof DashboardStats, label: 'Receita do Mês', icon: TrendingUp, format: 'currency' as const } ];
const SHORTCUTS = [ { view: "dashboard", label: "Dashboard", icon: Home }, { view: "orders", label: "Ordens de Serviço", icon: ClipboardList }, { view: "financial", label: "Financeiro", icon: DollarSign }, { view: 'reports', label: 'Relatórios', icon: BarChart3 }, { view: 'settings', label: 'Configurações', icon: Settings } ];

const getStatusBadgeClass = (status: string): string => STATUS_BADGE_CLASSES[status] || "bg-gray-100 text-gray-800";
const formatCurrency = (value: number | string): string => { const numericValue = typeof value === 'string' ? parseFloat(value) : value; if (isNaN(numericValue)) { return "R$ 0,00"; } return `R$ ${numericValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; };

// Componentes Memoizados
const EmptyRecentOrders = memo(() => ( <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4"><AlertTriangle className="mx-auto h-12 w-12" /><h3 className="mt-4 text-lg font-semibold">Nenhuma OS Recente</h3><p className="mt-2 text-sm">Novas ordens de serviço aparecerão aqui.</p></div> ));
const StatCard = memo(({ stat, value }: { stat: typeof DASHBOARD_CARDS[number], value?: number | string }) => { const Icon = stat.icon; return ( <Card><CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0"><CardTitle className="text-sm font-medium">{stat.label}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{value !== undefined ? (<div className="text-2xl font-bold">{stat.format === 'currency' ? formatCurrency(value) : value.toString()}</div>) : (<Skeleton className="h-8 w-24 mt-1" />)}</CardContent></Card> ); });
const OrderItem = memo(({ order, onNavigate }: { order: Order, onNavigate: (view: string) => void }) => ( <div className="flex items-center justify-between py-2 border-b last:border-0"><div className="flex-1 min-w-0"><p className="font-semibold truncate">{order.equipment}</p><p className="text-sm text-muted-foreground truncate">{order.client?.nome || 'Cliente não associado'}</p></div><div className="flex items-center gap-4 ml-4 flex-shrink-0"><Badge variant="outline" className={getStatusBadgeClass(order.status)}>{order.status}</Badge><Button variant="ghost" size="icon" onClick={() => onNavigate("orders")}><Eye className="w-4 h-4" /></Button></div></div> ));
const DashboardView = memo(({ stats, orders, onNavigate, isLoading }: { stats: DashboardStats | null, orders: Order[], onNavigate: (view: string) => void, isLoading: boolean }) => ( <div className="space-y-8 p-4 md:p-6 lg:p-8"><header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-foreground">Dashboard</h1><p className="text-muted-foreground">Visão geral do seu negócio</p></div><Button onClick={() => onNavigate("orders")}><Plus className="w-4 h-4 mr-2" />Nova OS</Button></header><section className="grid grid-cols-2 md:grid-cols-4 gap-6">{DASHBOARD_CARDS.map((stat) => <StatCard key={stat.key} stat={stat} value={stats?.[stat.key]} />)}</section><div className="grid md:grid-cols-3 gap-6"><Card className="md:col-span-2"><CardHeader><CardTitle>Ordens de Serviço Recentes</CardTitle></CardHeader><CardContent>{isLoading ? (<div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>) : orders.length > 0 ? (<div className="space-y-2">{orders.map(order => <OrderItem key={order.id} order={order} onNavigate={onNavigate} />)}</div>) : <EmptyRecentOrders />}</CardContent></Card><Card><CardHeader><CardTitle>Atalhos Rápidos</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4">{SHORTCUTS.map(({ view, label, icon: Icon }) => ( <Button key={view} variant="outline" className="h-20 flex flex-col gap-2" onClick={() => onNavigate(view)}><Icon className="w-5 h-5" /><span className="text-xs">{label}</span></Button> ))}</CardContent></Card></div></div> ));

export default function HomePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [currentView, setCurrentView] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isCompanyInfoLoading, setIsCompanyInfoLoading] = useState(true);

  const [isLoadingData, setIsLoadingData] = useState(false); // Inicia como false
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const handleSaveCompanyInfo = useCallback((data: Omit<CompanyInfo, 'id'>) => {
     const dataWithId: CompanyInfo = { ...data, id: companyInfo?.id || crypto.randomUUID() };
     try {
       localStorage.setItem('companyInfo', JSON.stringify(dataWithId));
       setCompanyInfo(dataWithId);
     } catch (error) { console.error("Falha ao salvar dados:", error); }
  }, [companyInfo?.id]);

  const handleViewChange = useCallback((view: string) => { if (view !== currentView) { setCurrentView(view); if (isMobile) setIsSidebarOpen(false); } }, [currentView, isMobile]);

  useEffect(() => { try { const savedData = localStorage.getItem('companyInfo'); if (savedData) { setCompanyInfo(JSON.parse(savedData)); } } catch (error) { console.error("Falha ao carregar dados da empresa:", error); } finally { setIsCompanyInfoLoading(false); } }, []);

  // *** CORREÇÃO DEFINITIVA DO LOOP ***
  useEffect(() => {
    // A função só será executada se a view for 'dashboard' e o usuário existir
    if (currentView === 'dashboard' && userId) {
      const loadDashboardData = async () => {
        setIsLoadingData(true);
        try {
          const [statsRes, ordersRes] = await Promise.all([
            fetch('/api/dashboard/stats'),
            fetch('/api/orders?limit=5&page=1')
          ]);

          if (statsRes.ok) {
            setDashboardStats(await statsRes.json());
          }
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            const validatedOrders = ordersData.data?.filter((o: any) => o.client) || [];
            setRecentOrders(validatedOrders);
          }
        } catch (error) {
          console.error("Falha ao carregar dados do dashboard:", error);
          toast.error("Não foi possível carregar os dados do painel.");
        } finally {
          setIsLoadingData(false);
        }
      };

      loadDashboardData();
    }
    // A dependência explícita em `currentView` e `userId` garante que a busca
    // ocorra apenas quando um deles muda, quebrando o ciclo de renderização.
  }, [currentView, userId]);

  useEffect(() => { const checkScreenSize = () => { const mobile = window.innerWidth < 768; setIsMobile(mobile); if (!mobile) setIsSidebarOpen(false); }; checkScreenSize(); window.addEventListener("resize", checkScreenSize); return () => window.removeEventListener("resize", checkScreenSize); }, []);

  const renderCurrentView = () => {
    if (isCompanyInfoLoading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    switch (currentView) {
      case 'dashboard': return <DashboardView stats={dashboardStats} orders={recentOrders} onNavigate={handleViewChange} isLoading={isLoadingData} />;
      case 'clients': return <ClientManagement />;
      case 'products': return <ProductManagement />;
      case 'orders': return <OrderManagement />;
      case 'financial': return <FinancialModule />;
      case 'reports': return <ReportsModule />;
      case 'settings': return <SettingsModule companyData={companyInfo} onSave={handleSaveCompanyInfo} />;
      default: return <PageSkeleton />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {!isCompanyInfoLoading && !companyInfo && (<CompanySetupModal isOpen={true} onSave={handleSaveCompanyInfo} />)}
      <SidebarNavigation currentView={currentView} onViewChange={handleViewChange} isMobile={isMobile} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} user={session?.user || null} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {isMobile && (<header className="flex items-center justify-between p-4 border-b bg-card"><h1 className="text-lg font-semibold">TechOS</h1><Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}><Menu className="w-5 h-5" /></Button></header>)}
        <main className="flex-1 overflow-y-auto bg-muted/40">{renderCurrentView()}</main>
      </div>
    </div>
  );
}
