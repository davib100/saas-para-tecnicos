"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/form-error"
import { Mail, Lock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const generateCompanyId = () => `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Validações do frontend
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Senha deve ter no mínimo 8 caracteres"
  }
  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return "Senha deve conter pelo menos uma letra"
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Senha deve conter pelo menos um número"
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return "Senha deve conter pelo menos um caractere especial (@$!%*?&)"
  }
  return null
}

const validateEmail = (email: string): string | null => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email inválido"
  }
  return null
}

const validateName = (name: string): string | null => {
  if (name.length < 2) {
    return "Nome deve ter no mínimo 2 caracteres"
  }
  return null
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const router = useRouter()

  const validateField = (field: keyof typeof registerData, value: string) => {
    let fieldError: string | null = null
    
    switch (field) {
      case 'name':
        fieldError = validateName(value)
        break
      case 'email':
        fieldError = validateEmail(value)
        break
      case 'password':
        fieldError = validatePassword(value)
        break
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError || ""
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validação completa antes do envio
    const nameError = validateName(registerData.name)
    const emailError = validateEmail(registerData.email)
    const passwordError = validatePassword(registerData.password)

    if (nameError || emailError || passwordError) {
      setFieldErrors({
        name: nameError || "",
        email: emailError || "",
        password: passwordError || ""
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...registerData,
          companyId: generateCompanyId()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/login?message=Conta criada com sucesso!")
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Erros de validação Zod do backend
          const backendErrors: Record<string, string> = {}
          data.details.forEach((detail: { field: string; message: string }) => {
            backendErrors[detail.field] = detail.message
          })
          setFieldErrors(backendErrors)
        } else {
          // Erro geral
          setError(data.error || "Erro ao criar conta")
        }
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof registerData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRegisterData(prev => ({ ...prev, [field]: value }))
    
    // Validação em tempo real
    if (value) {
      validateField(field, value)
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <User className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Crie sua Conta</h1>
          <p className="text-gray-600">Comece a gerenciar sua assistência técnica</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>Preencha os campos para criar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <FormError error={error} onDismiss={() => setError(null)} />
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    className={`pl-10 ${fieldErrors.name ? 'border-red-500' : ''}`}
                    value={registerData.name}
                    onChange={handleInputChange("name")}
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className={`pl-10 ${fieldErrors.email ? 'border-red-500' : ''}`}
                    value={registerData.email}
                    onChange={handleInputChange("email")}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={`pl-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
                    value={registerData.password}
                    onChange={handleInputChange("password")}
                    required
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
                {!fieldErrors.password && registerData.password && (
                  <p className="text-xs text-gray-500">
                    Deve conter: letra, número e caractere especial (@$!%*?&)
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              Já tem uma conta? <Link href="/login" className="underline">Faça login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}