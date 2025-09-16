'use client'

import { useState, memo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, Bell, Shield, Palette } from "lucide-react"
import { ErrorLogsDashboard } from "./error-logs-dashboard"
import CompanyModule from "./company-module"
import { toast } from "sonner"

interface SettingsModuleProps {
  companyData: any
  onSave: (data: any) => void
}

interface UserProfile {
  nome: string
  email: string
  telefone: string
  cargo: string
}

const initialProfile: UserProfile = {
  nome: "João Administrador",
  email: "admin@techfix.com",
  telefone: "(11) 98888-8888",
  cargo: "Administrador",
}

const PlaceholderCard = memo(({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Opções de {title.toLowerCase()} serão exibidas aqui.</p>
    </CardContent>
  </Card>
))

const UserProfileTab = memo(({ profile, onProfileChange, onSave }: {
  profile: UserProfile
  onProfileChange: (field: keyof UserProfile, value: string) => void
  onSave: () => void
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="w-5 h-5" />
        Perfil do Usuário
      </CardTitle>
      <CardDescription>Suas informações pessoais e de acesso</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input 
            id="nome" 
            value={profile.nome} 
            onChange={(e) => onProfileChange('nome', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo</Label>
          <Input 
            id="cargo" 
            value={profile.cargo} 
            onChange={(e) => onProfileChange('cargo', e.target.value)} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userEmail">Email</Label>
          <Input 
            id="userEmail" 
            type="email" 
            value={profile.email} 
            onChange={(e) => onProfileChange('email', e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userTelefone">Telefone</Label>
          <Input 
            id="userTelefone" 
            value={profile.telefone} 
            onChange={(e) => onProfileChange('telefone', e.target.value)} 
          />
        </div>
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium">Alterar Senha</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      <Button onClick={onSave}>Salvar Alterações</Button>
    </CardContent>
  </Card>
))

const SettingsModule = memo(({ companyData, onSave }: SettingsModuleProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile)

  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile)
          setUserProfile(parsedProfile)
        }
      } catch (error) {
        console.error("Falha ao carregar perfil:", error)
      }
    }
    
    loadUserProfile()
  }, [])

  useEffect(() => {
    const saveUserProfile = () => {
      try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile))
      } catch (error) {
        console.error("Falha ao salvar perfil:", error)
      }
    }
    
    saveUserProfile()
  }, [userProfile])

  const handleProfileChange = useCallback((field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSaveUserProfile = useCallback(() => {
    toast.success("Perfil atualizado com sucesso!")
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua empresa, conta e sistema.</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="company">
            <Building2 className="w-4 h-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="error-logs">Logs de Erros</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanyModule companyData={companyData} onSave={onSave} />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileTab 
            profile={userProfile} 
            onProfileChange={handleProfileChange} 
            onSave={handleSaveUserProfile} 
          />
        </TabsContent>

        <TabsContent value="notifications">
          <PlaceholderCard title="Notificações" />
        </TabsContent>
        
        <TabsContent value="security">
          <PlaceholderCard title="Segurança" />
        </TabsContent>
        
        <TabsContent value="appearance">
          <PlaceholderCard title="Aparência" />
        </TabsContent>
        
        <TabsContent value="error-logs">
          <ErrorLogsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
})

SettingsModule.displayName = 'SettingsModule'
export default SettingsModule