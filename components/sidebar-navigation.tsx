'use client'

import { Home, Users, Package, ClipboardList, BarChart3, Settings, LifeBuoy, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { view: "dashboard", label: "Dashboard", icon: Home },
  { view: "clients", label: "Clientes", icon: Users },
  { view: "products", label: "Produtos", icon: Package },
  { view: "orders", label: "Ordens de Serviço", icon: ClipboardList },
  { view: "reports", label: "Relatórios", icon: BarChart3 },
  // A rota "company" foi removida, mantendo apenas "settings"
  { view: "settings", label: "Configurações", icon: Settings },
] as const;

interface SidebarNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const NavLink = ({ 
    view, 
    label, 
    icon: Icon, 
    currentView, 
    onViewChange 
}: typeof NAV_ITEMS[number] & { currentView: string; onViewChange: (view: string) => void; }) => (
  <Button 
    variant={currentView === view ? "secondary" : "ghost"} 
    onClick={() => onViewChange(view)}
    className="justify-start w-full"
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </Button>
);

export const SidebarNavigation = ({ currentView, onViewChange, isMobile, isSidebarOpen, setIsSidebarOpen }: SidebarNavigationProps) => {
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary">TechOS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.view} {...item} currentView={currentView} onViewChange={onViewChange} />
        ))}
      </nav>
      <div className="p-4 mt-auto border-t">
        <Button variant="outline" className="justify-start w-full">
          <LifeBuoy className="w-4 h-4 mr-2" />
          Ajuda & Suporte
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
        <div className={`fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
                 <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5"/></Button>
            </div>
        </div>
    )
  }

  return (
    <aside className="w-64 border-r bg-card">
      {sidebarContent}
    </aside>
  )
}
