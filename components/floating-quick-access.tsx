"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Wrench, Sparkles } from "lucide-react"
import { QuickOrderModal } from "@/components/quick-order-modal"

export function FloatingQuickAccess() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative">
          {/* Pulse animation background */}
          <div className="absolute inset-0 gradient-primary rounded-full animate-ping opacity-20"></div>

          <Button
            onClick={() => setIsOrderModalOpen(true)}
            size="lg"
            className="relative h-16 w-16 rounded-full shadow-modern-xl hover:shadow-xl transition-all duration-300 hover:scale-110 gradient-primary border-0 group"
          >
            <div className="flex items-center justify-center relative">
              <Wrench className="w-6 h-6 transition-transform group-hover:rotate-12" />
              <Plus className="w-4 h-4 -ml-2 -mt-2 transition-transform group-hover:scale-125" />
            </div>
          </Button>

          {/* Sparkle effect */}
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
        </div>
      </div>

      {/* Modal de criação rápida de OS */}
      <QuickOrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
    </>
  )
}
