"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Mail, Lock, Phone, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [companyData, setCompanyData] = useState({
    razaoSocial: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    plano: "trial",
  })
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular login
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1500)
  }

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular cadastro
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Sistema OS</h1>
          <p className="text-gray-600">Gestão completa para assistência técnica</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>Entre com sua conta ou cadastre sua empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastrar Empresa</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
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
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleCompanyRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="razaoSocial"
                        placeholder="Nome da sua empresa"
                        className="pl-10"
                        value={companyData.razaoSocial}
                        onChange={(e) => setCompanyData({ ...companyData, razaoSocial: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={companyData.cnpj}
                      onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="companyEmail"
                        type="email"
                        placeholder="contato@empresa.com"
                        className="pl-10"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        value={companyData.telefone}
                        onChange={(e) => setCompanyData({ ...companyData, telefone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="endereco"
                        placeholder="Rua, número, cidade"
                        className="pl-10"
                        value={companyData.endereco}
                        onChange={(e) => setCompanyData({ ...companyData, endereco: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plano">Plano</Label>
                    <select
                      id="plano"
                      className="w-full p-2 border rounded-md"
                      value={companyData.plano}
                      onChange={(e) => setCompanyData({ ...companyData, plano: e.target.value })}
                    >
                      <option value="trial">Trial (30 dias grátis)</option>
                      <option value="basico">Básico - R$ 49/mês</option>
                      <option value="pro">Pro - R$ 99/mês</option>
                      <option value="premium">Premium - R$ 199/mês</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar Empresa"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
