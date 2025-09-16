'use client'

import { useState, useMemo, useCallback, useEffect, memo } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  Eye, 
  Activity, 
  AlertTriangle, 
  Menu, 
  Settings,
  Home, 
  Loader2 
} from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { CompanySetupModal } from "@/components/company-setup-modal"

// Dynamic imports
const ClientManagement = dynamic(() => import("@/components/client-management"))
const ProductManagement = dynamic(() => import("@/components/product-management"))
const OrderManagement = dynamic(() => import("@/components/order-management"))
const ReportsModule = dynamic(() => import("@/components/reports-module"))
const SettingsModule = dynamic(() => import("@/components/settings-module"))

// Interfaces
interface Order { 
  id: string;
  client: { nome: string; }; // Corrigido para 'nome'
  equipment: string;
  status: string;
}
interface DashboardStats { osAndamento: number; osConcluidas: number; orcamentosPendentes: number; receitaMensal: number; }
interface CompanyInfo { id: string; [key: string]: any; }

// Constantes
const STATUS_BADGE_CLASSES: Record<string, string> = {
  "Concluído": "bg-green-100 text-green-800",
  "Em Execução": "bg-purple-100 text-purple-800",
  "Aguardando Aprovação": "bg-yellow-100 text-yellow-800",
  "Cancelado": "bg-red-100 text-red-800",
  "Rascunho": "bg-gray-200 text-gray-800",
  "Orçamento Gerado": "bg-blue-100 text-blue-800",
};
const DASHBOARD_CARDS = [
  { key: 'osAndamento' as keyof DashboardStats, label: 'OS em Andamento', icon: Activity },
  { key: 'osConcluidas' as keyof DashboardStats, label: 'OS Concluídas no Mês', icon: ClipboardList },
  { key: 'orcamentosPendentes' as keyof DashboardStats, label: 'Orçamentos Pendentes', icon: DollarSign },
  { key: 'receitaMensal' as keyof DashboardStats, label: 'Receita do Mês', icon: TrendingUp, format: 'currency' as const }
];
const SHORTCUTS = [
  { view: "dashboard", label: "Dashboard", icon: Home },
  { view: "orders", label: "Ordens de Serviço", icon: ClipboardList },
  { view: 'reports', label: 'Relatórios', icon: BarChart3 },
  { view: 'settings', label: 'Configurações', icon: Settings }
];

// Funções e componentes puros (Implementação completa)
const getStatusBadgeClass = (status: string): string => STATUS_BADGE_CLASSES[status] || "bg-gray-100 text-gray-800";
const formatCurrency = (value: number): string => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EmptyRecentOrders = memo(() => (
  <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
    <AlertTriangle className="mx-auto h-12 w-12" />
    <h3 className="mt-4 text-lg font-semibold">Nenhuma OS Recente</h3>
    <p className="mt-2 text-sm">Novas ordens de serviço aparecerão aqui.</p>
  </div>
));

const StatCard = memo(({ stat, value }: { stat: typeof DASHBOARD_CARDS[number], value: number }) => {
  const Icon = stat.icon;
  const displayValue = stat.format === 'currency' ? formatCurrency(value) : value.toString();
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
      </CardContent>
    </Card>
  );
});

const OrderItem = memo(({ order, onNavigate }: { order: Order, onNavigate: (view: string) => void }) => (
  <div className="flex items-center justify-between py-2 border-b last:border-0">
    <div className="flex-1 min-w-0">
      <p className="font-semibold truncate">{order.equipment}</p>
      <p className="text-sm text-muted-foreground truncate">{order.client.nome}</p> {/* Corrigido para 'nome' */}
    </div>
    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
      <Badge variant="outline" className={getStatusBadgeClass(order.status)}>{order.status}</Badge>
      <Button variant="ghost" size="icon" onClick={() => onNavigate("orders")}><Eye className="w-4 h-4" /></Button>
    </div>
  </div>
));

const DashboardView = memo(({ stats, orders, onNavigate }: { stats: DashboardStats, orders: Order[], onNavigate: (view: string) => void }) => (
  <div className="space-y-8 p-4 md:p-6 lg:p-8">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>
      <Button onClick={() => onNavigate("orders")}><Plus className="w-4 h-4 mr-2" />Nova OS</Button>
    </header>
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {DASHBOARD_CARDS.map((stat) => <StatCard key={stat.key} stat={stat} value={stats[stat.key]} />)}
    </section>
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Ordens de Serviço Recentes</CardTitle></CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-2">{orders.map(order => <OrderItem key={order.id} order={order} onNavigate={onNavigate} />)}</div>
          ) : <EmptyRecentOrders />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Atalhos Rápidos</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {SHORTCUTS.map(({ view, label, icon: Icon }) => (
            <Button key={view} variant="outline" className="h-20 flex flex-col gap-2" onClick={() => onNavigate(view)}>
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
));

const LoadingState = memo(() => (
  <div className="flex h-full w-full items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
));

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [currentView, setCurrentView] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const handleSaveCompanyInfo = useCallback((data: Omit<CompanyInfo, 'id'>) => {
     const dataWithId: CompanyInfo = { ...data, id: companyInfo?.id || crypto.randomUUID() };
     try {
       localStorage.setItem('companyInfo', JSON.stringify(dataWithId));
       setCompanyInfo(dataWithId);
     } catch (error) { console.error("Falha ao salvar dados:", error); }
  }, [companyInfo?.id]);

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view);
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem('companyInfo');
        if (savedData) setCompanyInfo(JSON.parse(savedData));
        
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/orders?limit=5&page=1')
        ]);

        if (statsRes.ok) setDashboardStats(await statsRes.json());
        else throw new Error('Falha ao buscar estatísticas');

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.data || []);
        } else {
          throw new Error('Falha ao buscar OS recentes');
        }

      } catch (error) {
        console.error("Falha ao carregar dados do dashboard:", error);
        toast.error("Não foi possível carregar os dados do painel.")
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionStatus === 'authenticated') {
      loadInitialData();
    }
  }, [sessionStatus]);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const renderCurrentView = useMemo(() => {
    if (isLoading) return <LoadingState />;

    switch (currentView) {
      case 'dashboard':
        return dashboardStats ? <DashboardView stats={dashboardStats} orders={recentOrders} onNavigate={handleViewChange} /> : <LoadingState />;
      case 'clients': return <ClientManagement />;
      case 'products': return <ProductManagement />;
      case 'orders': return <OrderManagement />;
      case 'reports': return <ReportsModule />;
      case 'settings': return <SettingsModule companyData={companyInfo} onSave={handleSaveCompanyInfo} />;
      default: return <LoadingState />;
    }
  }, [currentView, companyInfo, handleViewChange, dashboardStats, recentOrders, handleSaveCompanyInfo, isLoading]);

  // Se a sessão ainda está carregando, mostre o loading global
  if (sessionStatus === 'loading') {
    return <LoadingState />;
  }

  // Se não houver informações da empresa, mostre o modal de configuração
  if (!companyInfo) {
    return <CompanySetupModal isOpen={true} onSave={handleSaveCompanyInfo} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen} 
        user={session?.user || null}
      />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {isMobile && (
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <h1 className="text-lg font-semibold">TechOS</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}><Menu className="w-5 h-5" /></Button>
          </header>
        )}
        <main className="flex-1 overflow-y-auto bg-muted/40">
          {renderCurrentView}
        </main>
      </div>
    </div>
  );
}

// DisplayNames
EmptyRecentOrders.displayName = 'EmptyRecentOrders'
StatCard.displayName = 'StatCard'
OrderItem.displayName = 'OrderItem'
DashboardView.displayName = 'DashboardView'
LoadingState.displayName = 'LoadingState'
