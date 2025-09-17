'use client'

import { useState, useCallback } from 'react'
import { Plus, X, ClipboardList, Users, Package, Settings, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FloatingQuickAccessProps {
  onAction: (action: string) => void
  className?: string
}

const QUICK_ACTIONS = [
  {
    key: 'new-order',
    label: 'Nova OS',
    icon: ClipboardList,
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Criar ordem de serviço'
  },
  {
    key: 'new-client',
    label: 'Cliente',
    icon: Users,
    gradient: 'from-green-500 to-emerald-600',
    description: 'Cadastrar cliente'
  },
  {
    key: 'new-product',
    label: 'Produto',
    icon: Package,
    gradient: 'from-purple-500 to-violet-600',
    description: 'Adicionar produto'
  },
  {
    key: 'settings',
    label: 'Config',
    icon: Settings,
    gradient: 'from-orange-500 to-red-600',
    description: 'Configurações'
  },
]

export function FloatingQuickAccess({ onAction, className }: FloatingQuickAccessProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const handleAction = useCallback((actionKey: string) => {
    onAction(actionKey)
    setIsOpen(false)
  }, [onAction])

  return (
    <div className={cn("fixed bottom-6 right-6 z-40", className)}>
      {/* Quick Action Buttons */}
      <div className={cn(
        "flex flex-col gap-3 mb-4 transition-all-smooth",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon
          return (
            <Card
              key={action.key}
              className={cn(
                "group cursor-pointer hover-lift-gentle transition-all-smooth animate-slide-up",
                "p-3 w-auto min-w-[200px] glass-effect shadow-modern-xl"
              )}
              style={{ 
                '--stagger-delay': QUICK_ACTIONS.length - index - 1,
                animationDelay: isOpen ? `${(QUICK_ACTIONS.length - index - 1) * 50}ms` : '0ms'
              } as React.CSSProperties}
              onClick={() => handleAction(action.key)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center text-white shadow-modern",
                  `bg-gradient-to-br ${action.gradient}`
                )}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main Floating Button */}
      <Button
        size="lg"
        className={cn(
          "size-14 rounded-2xl shadow-modern-2xl transition-all-smooth",
          "bg-gradient-to-br from-primary to-primary/80 text-white",
          "hover:shadow-modern-2xl hover:scale-110 active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-4",
          isOpen && "rotate-45"
        )}
        onClick={handleToggle}
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <div className="relative">
            <Plus className="size-6" />
            <div className="absolute -top-1 -right-1 size-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse">
              <Sparkles className="size-2 text-white m-0.5" />
            </div>
          </div>
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/20 backdrop-blur-sm -z-10 animate-fade-in"
          onClick={handleToggle}
        />
      )}
    </div>
  )
}