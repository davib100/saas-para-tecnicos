"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Menu,
  X,
} from "lucide-react"
import { RealtimeStatus } from "./realtime-status"

interface SidebarNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "products", label: "Produtos", icon: Package },
  { id: "orders", label: "Ordens de Serviço", icon: ClipboardList },
  { id: "financial", label: "Financeiro", icon: DollarSign },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "settings", label: "Configurações", icon: Settings },
]

export function SidebarNavigation({ currentView, onViewChange }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(false)
        setIsMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleViewChange = (view: string) => {
    onViewChange(view)
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col shadow-modern z-50 md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 gradient-primary rounded-xl shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base text-sidebar-foreground">TechOS</span>
                  <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:bg-sidebar-accent/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status da Conexão</span>
              <RealtimeStatus />
            </div>
          </div>

          <nav className="flex-1 p-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start transition-all duration-200 h-11 text-sm",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md hover:bg-sidebar-accent/90"
                        : "hover:bg-sidebar-accent/10 text-sidebar-foreground hover:text-sidebar-accent",
                    )}
                    onClick={() => handleViewChange(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 h-11 text-sm"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-modern hidden md:flex",
        isCollapsed ? "w-16" : "w-64 lg:w-72",
      )}
    >
      <div className="p-4 lg:p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="p-1.5 lg:p-2 gradient-primary rounded-lg lg:rounded-xl shadow-md">
                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-base lg:text-lg text-sidebar-foreground">TechOS</span>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto hover:bg-sidebar-accent/10 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        {!isCollapsed && (
          <div className="mt-3 lg:mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status da Conexão</span>
            <RealtimeStatus />
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 lg:p-4">
        <div className="space-y-1 lg:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200 h-10 lg:h-12 text-sm",
                  isCollapsed && "px-2 lg:px-3",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md hover:bg-sidebar-accent/90"
                    : "hover:bg-sidebar-accent/10 text-sidebar-foreground hover:text-sidebar-accent",
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className={cn("w-4 h-4 lg:w-5 lg:h-5", !isCollapsed && "mr-2 lg:mr-3")} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Button>
            )
          })}
        </div>
      </nav>

      <div className="p-3 lg:p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 h-10 lg:h-12 text-sm",
            isCollapsed && "px-2 lg:px-3",
          )}
        >
          <LogOut className={cn("w-4 h-4 lg:w-5 lg:h-5", !isCollapsed && "mr-2 lg:mr-3")} />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </Button>
      </div>
    </div>
  )
}
