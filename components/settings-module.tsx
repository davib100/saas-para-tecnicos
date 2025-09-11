"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, Bell, Shield, Palette, Upload } from "lucide-react"
import { ErrorLogsDashboard } from "./error-logs-dashboard"

const SettingsModule = () => {
  const [companyData, setCompanyData] = useState({
    razaoSocial: "TechFix Assistência Técnica",
    cnpj: "12.345.678/0001-90",
    endereco: "Rua da Tecnologia, 123 - São Paulo/SP",
    telefone: "(11) 99999-9999",
    email: "contato@techfix.com",
    website: "www.techfix.com",
  })

  const [userProfile, setUserProfile] = useState({
    nome: "João Administrador",
    email: "admin@techfix.com",
    telefone: "(11) 98888-8888",
    cargo: "Administrador",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua empresa e perfil</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="error-logs">Logs de Erros</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>Informações que aparecerão nos orçamentos e documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={companyData.razaoSocial}
                    onChange={(e) => setCompanyData({ ...companyData, razaoSocial: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={companyData.cnpj}
                    onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={companyData.endereco}
                  onChange={(e) => setCompanyData({ ...companyData, endereco: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={companyData.telefone}
                    onChange={(e) => setCompanyData({ ...companyData, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo da Empresa</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Clique para fazer upload do logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
                </div>
              </div>

              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
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
                  <Input
                    id="nome"
                    value={userProfile.nome}
                    onChange={(e) => setUserProfile({ ...userProfile, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={userProfile.cargo}
                    onChange={(e) => setUserProfile({ ...userProfile, cargo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userTelefone">Telefone</Label>
                  <Input
                    id="userTelefone"
                    value={userProfile.telefone}
                    onChange={(e) => setUserProfile({ ...userProfile, telefone: e.target.value })}
                  />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
              <CardDescription>Configure como e quando receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nova OS criada</p>
                    <p className="text-sm text-muted-foreground">Receber notificação quando uma nova OS for criada</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Orçamento aprovado</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um orçamento for aprovado pelo cliente
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pagamento recebido</p>
                    <p className="text-sm text-muted-foreground">Notificar quando um pagamento for confirmado</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estoque baixo</p>
                    <p className="text-sm text-muted-foreground">Alertar quando produtos estiverem com estoque baixo</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>

              <Button>Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </CardTitle>
              <CardDescription>Configurações de segurança e privacidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação de dois fatores</p>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sessões ativas</p>
                    <p className="text-sm text-muted-foreground">Gerencie dispositivos conectados</p>
                  </div>
                  <Button variant="outline">Ver Sessões</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Log de atividades</p>
                    <p className="text-sm text-muted-foreground">Histórico de ações no sistema</p>
                  </div>
                  <Button variant="outline">Ver Logs</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Tema</Label>
                  <div className="flex gap-4 mt-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Claro
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Escuro
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Automático
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Cor primária</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="w-8 h-8 bg-blue-600 rounded cursor-pointer border-2 border-blue-600"></div>
                    <div className="w-8 h-8 bg-green-600 rounded cursor-pointer border-2 border-transparent"></div>
                    <div className="w-8 h-8 bg-purple-600 rounded cursor-pointer border-2 border-transparent"></div>
                    <div className="w-8 h-8 bg-red-600 rounded cursor-pointer border-2 border-transparent"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sidebar compacta</p>
                    <p className="text-sm text-muted-foreground">Usar sidebar em modo compacto por padrão</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>

              <Button>Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-logs">
          <ErrorLogsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { SettingsModule }
export default SettingsModule
