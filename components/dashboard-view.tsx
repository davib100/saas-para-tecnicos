'use client'

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Users,
  Package,
  ArrowRight,
  CheckCircle,
  Calendar,
  Sparkles,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface DashboardViewProps {
  stats: DashboardStats;
  orders: Order[];
  onNavigate: (view: string) => void;
}

// Enhanced Status Configuration
const STATUS_CONFIG = {
  "Concluído": { 
    color: "success", 
    icon: CheckCircle,
    gradient: "from-green-500 to-emerald-600"
  },
  "Em Execução": { 
    color: "info", 
    icon: Activity,
    gradient: "from-blue-500 to-indigo-600"
  },
  "Aguardando Aprovação": { 
    color: "warning", 
    icon: Clock,
    gradient: "from-yellow-500 to-orange-600"
  },
  "Cancelado": { 
    color: "destructive", 
    icon: AlertTriangle,
    gradient: "from-red-500 to-rose-600"
  },
  "Rascunho": { 
    color: "secondary", 
    icon: Activity,
    gradient: "from-gray-500 to-slate-600"
  },
  "Orçamento Gerado": { 
    color: "info", 
    icon: DollarSign,
    gradient: "from-purple-500 to-violet-600"
  },
} as const;

// Enhanced Dashboard Cards Configuration
const DASHBOARD_CARDS = [
  { 
    key: 'osAndamento' as keyof DashboardStats, 
    label: 'OS em Andamento', 
    icon: Activity, 
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Ordens sendo executadas'
  },
  { 
    key: 'osConcluidas' as keyof DashboardStats, 
    label: 'OS Concluídas', 
    icon: CheckCircle, 
    gradient: 'from-green-500 to-emerald-600',
    description: 'Concluídas neste mês'
  },
  { 
    key: 'orcamentosPendentes' as keyof DashboardStats, 
    label: 'Orçamentos Pendentes', 
    icon: DollarSign, 
    gradient: 'from-yellow-500 to-orange-600',
    description: 'Aguardando aprovação'
  },
  { 
    key: 'receitaMensal' as keyof DashboardStats, 
    label: 'Receita do Mês', 
    icon: TrendingUp, 
    format: 'currency' as const,
    gradient: 'from-purple-500 to-violet-600',
    description: 'Faturamento atual'
  }
];

// Quick Actions Configuration
const QUICK_ACTIONS = [
  { 
    view: "orders", 
    label: "Nova OS", 
    icon: ClipboardList, 
    description: "Criar ordem de serviço",
    gradient: "from-blue-500 to-indigo-600"
  },
  { 
    view: "clients", 
    label: "Novo Cliente", 
    icon: Users, 
    description: "Cadastrar cliente",
    gradient: "from-green-500 to-emerald-600"
  },
  { 
    view: "products", 
    label: "Produto", 
    icon: Package, 
    description: "Gerenciar estoque",
    gradient: "from-purple-500 to-violet-600"
  },
  { 
    view: 'reports', 
    label: 'Relatórios', 
    icon: BarChart3, 
    description: "Ver análises",
    gradient: "from-orange-500 to-red-600"
  }
];

// Utility Functions
const formatCurrency = (value: number): string => 
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Sub-Components
const EmptyRecentOrders = memo(() => (
  <div className="text-center py-16 animate-fade-in">
    <div className="size-16 mx-auto mb-6 rounded-2xl gradient-primary/10 flex items-center justify-center">
      <AlertTriangle className="size-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Nenhuma OS Recente</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Novas ordens de serviço aparecerão aqui.
    </p>
    <Button variant="outline" size="sm">
      <Plus className="size-4 mr-2" />
      Criar primeira OS
    </Button>
  </div>
));

const StatCard = memo(({ 
  stat, 
  value, 
  index 
}: { 
  stat: typeof DASHBOARD_CARDS[number]; 
  value: number;
  index: number;
}) => {
  const Icon = stat.icon;
  const displayValue = stat.format === 'currency' ? formatCurrency(value) : value.toLocaleString();
  
  return (
    <Card 
      variant="glass" 
      hover 
      className={cn(
        "relative overflow-hidden entrance-scale",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-5",
        `before:${stat.gradient}`
      )}
      style={{ '--stagger-delay': index } as React.CSSProperties}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={cn(
            "size-12 rounded-xl flex items-center justify-center shadow-modern",
            `bg-gradient-to-br ${stat.gradient} text-white`
          )}>
            <Icon className="size-6" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gradient">
              {displayValue}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div>
          <h3 className="font-semibold text-sm mb-1">{stat.label}</h3>
          <p className="text-xs text-muted-foreground">{stat.description}</p>
        </div>
      </CardContent>
    </Card>
  );
});

const OrderItem = memo(({ 
  order, 
  onNavigate,
  index
}: { 
  order: Order; 
  onNavigate: (view: string) => void;
  index: number;
}) => {
  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || Activity;
  
  return (
    <div 
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl border bg-card/50 transition-all-smooth",
        "hover:bg-card hover:shadow-modern hover-lift-gentle entrance-slide-up"
      )}
      style={{ '--stagger-delay': index } as React.CSSProperties}
    >
      <div className={cn(
        "size-10 rounded-lg flex items-center justify-center",
        `bg-gradient-to-br ${statusConfig?.gradient || 'from-gray-500 to-slate-600'} text-white shadow-modern`
      )}>
        <StatusIcon className="size-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors-smooth">
          {order.equipment}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground truncate">
            {order.client.nome}
          </p>
          <span className="text-xs text-muted-foreground">•</span>
          <p className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge 
          variant={statusConfig?.color as any || 'secondary'} 
          size="sm"
          className="shadow-modern"
        >
          {order.status}
        </Badge>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={() => onNavigate("orders")}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="size-4" />
        </Button>
      </div>
    </div>
  );
});

const QuickActionCard = memo(({ 
  action, 
  onNavigate,
  index 
}: { 
  action: typeof QUICK_ACTIONS[number]; 
  onNavigate: (view: string) => void;
  index: number;
}) => {
  const Icon = action.icon;
  
  return (
    <Card
      variant="glass"
      hover
      className={cn(
        "relative overflow-hidden cursor-pointer entrance-scale",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-5",
        `before:${action.gradient}`
      )}
      style={{ '--stagger-delay': index } as React.CSSProperties}
      onClick={() => onNavigate(action.view)}
    >
      <CardContent className="p-6 text-center">
        <div className={cn(
          "size-14 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-modern",
          `bg-gradient-to-br ${action.gradient} text-white`
        )}>
          <Icon className="size-7" />
        </div>
        <h3 className="font-semibold text-sm mb-1">{action.label}</h3>
        <p className="text-xs text-muted-foreground">{action.description}</p>
      </CardContent>
    </Card>
  );
});

// Main Dashboard Component
export const DashboardView = memo(({ 
  stats, 
  orders, 
  onNavigate 
}: DashboardViewProps) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl gradient-primary flex items-center justify-center shadow-modern">
              <Sparkles className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral do seu negócio</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg">
            <Calendar className="size-4 mr-2" />
            Hoje
          </Button>
          <Button size="lg" onClick={() => onNavigate("orders")} className="shadow-modern">
            <Plus className="size-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 stagger-children">
        {DASHBOARD_CARDS.map((stat, index) => (
          <StatCard 
            key={stat.key} 
            stat={stat} 
            value={stats[stat.key] ?? 0} 
            index={index}
          />
        ))}
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card variant="glass" className="lg:col-span-2 entrance-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <ClipboardList className="size-5 text-primary" />
                  Ordens de Serviço Recentes
                </CardTitle>
                <CardDescription>
                  Últimas {orders.length} ordens registradas no sistema
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate("orders")}
              >
                Ver todas
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-3 stagger-children">
                {orders.map((order, index) => (
                  <OrderItem 
                    key={order.id} 
                    order={order} 
                    onNavigate={onNavigate}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyRecentOrders />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="glass" className="entrance-slide-up animate-delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 stagger-children">
              {QUICK_ACTIONS.map((action, index) => (
                <QuickActionCard
                  key={action.view}
                  action={action}
                  onNavigate={onNavigate}
                  index={index}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
));

// Display Names
EmptyRecentOrders.displayName = 'EmptyRecentOrders'
StatCard.displayName = 'StatCard'
OrderItem.displayName = 'OrderItem'
QuickActionCard.displayName = 'QuickActionCard'
DashboardView.displayName = 'DashboardView'

export default DashboardView