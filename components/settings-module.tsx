'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, Bell, Shield, Palette } from "lucide-react"
import { ErrorLogsDashboard } from "./error-logs-dashboard"
import CompanyModule from "./company-module" // Importa o módulo da empresa

// O componente agora precisa receber os dados da empresa para passar para o CompanyModule
interface SettingsModuleProps {
    companyData: any;
}

const SettingsModule = ({ companyData }: SettingsModuleProps) => {
  const [userProfile, setUserProfile] = useState({
    nome: "João Administrador",
    email: "admin@techfix.com",
    telefone: "(11) 98888-8888",
    cargo: "Administrador",
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua empresa, conta e sistema.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6"> // Inicia na aba "Empresa"
        <TabsList>
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2"/>Empresa</TabsTrigger>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/>Perfil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2"/>Notificações</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2"/>Segurança</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2"/>Aparência</TabsTrigger>
          <TabsTrigger value="error-logs">Logs de Erros</TabsTrigger>
        </TabsList>

        {/* Nova aba para os dados da empresa */}
        <TabsContent value="company">
            <CompanyModule companyData={companyData} />
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil do Usuário
              </CardTitle>
              <CardDescription>Suas informações pessoais e de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={userProfile.nome} onChange={(e) => setUserProfile({ ...userProfile, nome: e.target.value })} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" value={userProfile.cargo} onChange={(e) => setUserProfile({ ...userProfile, cargo: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input id="userEmail" type="email" value={userProfile.email} onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="userTelefone">Telefone</Label>
                  <Input id="userTelefone" value={userProfile.telefone} onChange={(e) => setUserProfile({ ...userProfile, telefone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Alterar Senha</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                </div>
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications"> 
            <Card><CardHeader><CardTitle>Notificações</CardTitle></CardHeader><CardContent><p>Opções de notificação serão exibidas aqui.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="security">
            <Card><CardHeader><CardTitle>Segurança</CardTitle></CardHeader><CardContent><p>Opções de segurança serão exibidas aqui.</p></CardContent></Card>
        </TabsContent>
         <TabsContent value="appearance">
            <Card><CardHeader><CardTitle>Aparência</CardTitle></CardHeader><CardContent><p>Opções de aparência serão exibidas aqui.</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="error-logs">
          <ErrorLogsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsModule
