"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Exibe mensagens de sucesso (ex: após redefinir a senha)
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }
    // Exibe erros do NextAuth (ex: credenciais inválidas)
    const errorParam = searchParams.get('error')
    if (errorParam) {
      // Decodifica a mensagem de erro padrão do NextAuth ou usa a nossa.
      if (errorParam === "CredentialsSignin") {
        // Tentamos obter uma mensagem mais específica do `signIn` na próxima renderização
      } else {
        setError(errorParam)
      }
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const result = await signIn("credentials", {
      redirect: false,
      email: loginData.email,
      password: loginData.password,
    })

    setIsLoading(false)

    if (result?.ok) {
      // Redireciona para a home ou para a página anterior
      const callbackUrl = searchParams.get('callbackUrl') || '/'
      router.push(callbackUrl)
    } else {
      // A mensagem de erro específica que configuramos no NextAuth é retornada aqui
      setError(result?.error || "Ocorreu um erro desconhecido.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema OS</h1>
          <p className="text-gray-600">Gestão completa para assistência técnica</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>Entre com sua conta para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-center text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            {successMessage && <p className="mb-4 text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="text-right text-sm pt-1">
                  <Link href="/forgot-password" prefetch={false} className="underline text-gray-600 hover:text-gray-900">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/register" className="underline">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}