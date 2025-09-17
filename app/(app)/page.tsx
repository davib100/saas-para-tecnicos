'use client'

import { useState, useMemo, useCallback, useEffect, memo } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Menu } from "lucide-react"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { CompanySetupModal } from "@/components/company-setup-modal"
import { DashboardView } from "@/components/dashboard-view"

// Dynamic imports for better performance
const ClientManagement = dynamic(() => import("@/components/client-management"), {
  loading: () => <LoadingSpinner size="lg" text="Carregando Clientes..." />
})
const ProductManagement = dynamic(() => import("@/components/product-management"), {
  loading: () => <LoadingSpinner size="lg" text="Carregando Produtos..." />
})
const OrderManagement = dynamic(() => import("@/components/order-management"), {
  loading: () => <LoadingSpinner size="lg" text="Carregando Ordens..." />
})
const ReportsModule = dynamic(() => import("@/components/reports-module"), {
  loading: () => <LoadingSpinner size="lg" text="Carregando Relatórios..." />
})
const SettingsModule = dynamic(() => import("@/components/settings-module"), {
  loading: () => <LoadingSpinner size="lg" text="Carregando Configurações..." />
})

// Interfaces
interface Order { 
  id: string;
  client: { nome: string; };
  equipment: string;
  status: string;
  createdAt: string;
  priority?: 'baixa' | 'media' | 'alta';
}

interface DashboardStats { 
  osAndamento: number; 
  osConcluidas: number; 
  orcamentosPendentes: number; 
  receitaMensal: number;
  osHoje?: number;
  clientesAtivos?: number;
  produtosEstoque?: number;
  ticketMedio?: number;
}

interface CompanyInfo { 
  id: string; 
  [key: string]: any; 
}

// Components
const LoadingState = memo(() => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
    <LoadingSpinner size="lg" variant="gradient" text="Carregando dashboard..." />
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

  // Callbacks
  const handleSaveCompanyInfo = useCallback((data: Omit<CompanyInfo, 'id'>) => {
     const dataWithId: CompanyInfo = { ...data, id: companyInfo?.id || crypto.randomUUID() };
     try {
       localStorage.setItem('companyInfo', JSON.stringify(dataWithId));
       setCompanyInfo(dataWithId);
     } catch (error) { 
       console.error("Falha ao salvar dados:", error); 
     }
  }, [companyInfo?.id]);

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view);
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  // Effects
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const savedData = localStorage.getItem('companyInfo');
        if (savedData) setCompanyInfo(JSON.parse(savedData));
        
        // Simulate API calls with better mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockStats: DashboardStats = {
          osAndamento: 12,
          osConcluidas: 45,
          orcamentosPendentes: 8,
          receitaMensal: 35420.50,
          osHoje: 3,
          clientesAtivos: 156,
          produtosEstoque: 234,
          ticketMedio: 1245.30
        };
        
        const mockOrders: Order[] = [
          {
            id: "OS001",
            client: { nome: "João Silva" },
            equipment: "Notebook Dell Inspiron",
            status: "Em Execução",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            priority: "alta"
          },
          {
            id: "OS002", 
            client: { nome: "Maria Santos" },
            equipment: "Impressora HP LaserJet",
            status: "Aguardando Aprovação",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            priority: "media"
          },
          {
            id: "OS003",
            client: { nome: "Pedro Costa" },
            equipment: "Desktop Gamer",
            status: "Concluído",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            priority: "baixa"
          }
        ];
        
        setDashboardStats(mockStats);
        setRecentOrders(mockOrders);

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
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Render current view
  const renderCurrentView = useMemo(() => {
    if (isLoading) return <LoadingState />;

    switch (currentView) {
      case 'dashboard':
        return dashboardStats ? (
          <DashboardView 
            stats={dashboardStats} 
            orders={recentOrders} 
            onNavigate={handleViewChange} 
          />
        ) : <LoadingState />;
      case 'clients': return <ClientManagement />;
      case 'products': return <ProductManagement />;
      case 'orders': return <OrderManagement />;
      case 'reports': return <ReportsModule />;
      case 'settings': return <SettingsModule companyData={companyInfo} onSave={handleSaveCompanyInfo} />;
      default: return <LoadingState />;
    }
  }, [currentView, companyInfo, handleViewChange, dashboardStats, recentOrders, handleSaveCompanyInfo, isLoading]);

  // Loading state
  if (sessionStatus === 'loading') {
    return <LoadingState />;
  }

  // Company setup
  if (!companyInfo) {
    return <CompanySetupModal isOpen={true} onSave={handleSaveCompanyInfo} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
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
          <header className="flex items-center justify-between p-4 border-b bg-card/50 glass-effect">
            <h1 className="text-lg font-semibold text-gradient">TechOS</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </header>
        )}
        
        <main className="flex-1 overflow-y-auto">
          {renderCurrentView}
        </main>
      </div>
    </div>
  );
}

// Display Names
LoadingState.displayName = 'LoadingState'