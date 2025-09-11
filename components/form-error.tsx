"use client"

import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface FormErrorProps {
  error: string | null
  onDismiss?: () => void
}

export function FormError({ error, onDismiss }: FormErrorProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss} className="h-auto p-1 hover:bg-transparent">
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
