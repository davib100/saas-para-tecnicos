'use client'

import { Home, Users, Package, ClipboardList, BarChart3, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav" // Importando o novo componente

// Supondo que você tenha um tipo User definido em algum lugar
interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

const NAV_ITEMS = [
  { view: "dashboard", label: "Dashboard", icon: Home },
  { view: "clients", label: "Clientes", icon: Users },
  { view: "products", label: "Produtos", icon: Package },
  { view: "orders", label: "Ordens de Serviço", icon: ClipboardList },
  { view: "reports", label: "Relatórios", icon: BarChart3 },
  { view: "settings", label: "Configurações", icon: Settings },
] as const;

interface SidebarNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  user: User | null; // Adicionando a prop user
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

export const SidebarNavigation = ({ currentView, onViewChange, isMobile, isSidebarOpen, setIsSidebarOpen, user }: SidebarNavigationProps) => {
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
      {/* Substituindo o botão de Ajuda pelo UserNav */}
      <div className="p-2 mt-auto border-t">
        <UserNav user={user} />
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
