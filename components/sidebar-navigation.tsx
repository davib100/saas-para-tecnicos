'use client'

import { useState } from "react"
import { Home, Users, Package, ClipboardList, BarChart3, Settings, Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { cn } from "@/lib/utils"

// User interface
interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

const NAV_ITEMS = [
  { view: "dashboard", label: "Dashboard", icon: Home, description: "Visão geral do sistema" },
  { view: "clients", label: "Clientes", icon: Users, description: "Gerenciar clientes" },
  { view: "products", label: "Produtos", icon: Package, description: "Controle de estoque" },
  { view: "orders", label: "Ordens de Serviço", icon: ClipboardList, description: "OS em andamento" },
  { view: "reports", label: "Relatórios", icon: BarChart3, description: "Análises e métricas" },
  { view: "settings", label: "Configurações", icon: Settings, description: "Configurar sistema" },
] as const;

interface SidebarNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  user: User | null;
}

const NavLink = ({ 
    view, 
    label, 
    icon: Icon, 
    description,
    currentView, 
    onViewChange,
    isMobile = false 
}: typeof NAV_ITEMS[number] & { 
  currentView: string; 
  onViewChange: (view: string) => void;
  isMobile?: boolean;
}) => {
  const isActive = currentView === view;
  
  return (
    <button
      onClick={() => onViewChange(view)}
      className={cn(
        "group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all-smooth",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2",
        isActive && [
          "bg-sidebar-primary text-sidebar-primary-foreground shadow-modern",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-sidebar-primary/50 before:to-transparent before:opacity-50"
        ]
      )}
    >
      <div className={cn(
        "flex-shrink-0 transition-transform-smooth group-hover:scale-110",
        isActive && "text-sidebar-primary-foreground"
      )}>
        <Icon className="size-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-medium text-sm truncate transition-colors-smooth",
          isActive && "text-sidebar-primary-foreground"
        )}>
          {label}
        </div>
        {!isMobile && (
          <div className={cn(
            "text-xs opacity-70 truncate transition-colors-smooth",
            isActive ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/60"
          )}>
            {description}
          </div>
        )}
      </div>
      
      {isActive && (
        <ChevronRight className="size-4 flex-shrink-0 text-sidebar-primary-foreground animate-fade-in" />
      )}
    </button>
  );
};

const SidebarBrand = () => (
  <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
    <div className="size-10 rounded-xl gradient-primary flex items-center justify-center shadow-modern">
      <span className="text-lg font-bold text-white">T</span>
    </div>
    <div className="flex-1">
      <h1 className="text-xl font-bold text-sidebar-foreground">TechOS</h1>
      <p className="text-xs text-sidebar-foreground/60">Sistema de OS</p>
    </div>
  </div>
);

const SidebarContent = ({ currentView, onViewChange, user, isMobile }: {
  currentView: string;
  onViewChange: (view: string) => void;
  user: User | null;
  isMobile: boolean;
}) => (
  <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
    <SidebarBrand />
    
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <div className="space-y-1">
        {NAV_ITEMS.map((item, index) => (
          <div
            key={item.view}
            className="animate-slide-up"
            style={{ '--stagger-delay': index } as React.CSSProperties}
          >
            <NavLink 
              {...item} 
              currentView={currentView} 
              onViewChange={onViewChange}
              isMobile={isMobile}
            />
          </div>
        ))}
      </div>
    </nav>
    
    <div className="border-t border-sidebar-border p-4">
      <UserNav user={user} />
    </div>
  </div>
);

export const SidebarNavigation = ({ 
  currentView, 
  onViewChange, 
  isMobile, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  user 
}: SidebarNavigationProps) => {
  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        <div 
          className={cn(
            "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all-smooth",
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform transition-transform-smooth shadow-modern-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent 
            currentView={currentView}
            onViewChange={onViewChange}
            user={user}
            isMobile={isMobile}
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 z-10" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
      </>
    )
  }

  return (
    <aside className="w-80 border-r border-sidebar-border shadow-modern animate-slide-right">
      <SidebarContent 
        currentView={currentView}
        onViewChange={onViewChange}
        user={user}
        isMobile={isMobile}
      />
    </aside>
  )
}