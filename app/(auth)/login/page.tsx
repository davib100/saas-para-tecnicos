'use client'

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
  const router = useRouter() // router ainda pode ser útil para outras coisas no futuro
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.")
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
      redirect: false, // Manter o controle do redirecionamento para mostrar erros
      email: loginData.email,
      password: loginData.password,
    })

    setIsLoading(false)

    if (result?.ok) {
      // SOLUÇÃO: Forçar um recarregamento completo da página.
      // Isso resolve a condição de corrida onde a navegação do Next.js (router.push)
      // é mais rápida do que o navegador ao definir o cookie de sessão retornado pela API.
      // Ao forçar o recarregamento, garantimos que a próxima requisição para o servidor
      // (para a callbackUrl) já incluirá o novo cookie de sessão, e o middleware
      // irá reconhecer o usuário como autenticado.
      const callbackUrl = searchParams.get('callbackUrl') || '/'
      window.location.href = callbackUrl;
    } else {
      // Mostra o erro retornado pela API de credenciais ou uma mensagem padrão
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
