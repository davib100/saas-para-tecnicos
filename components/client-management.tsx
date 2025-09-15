'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, User, Building, Phone, Mail, MapPin, Users as UsersIcon } from "lucide-react"
import { ClientWizard } from "./client-wizard"

interface Client {
  id: string
  nome: string
  tipo: "PF" | "PJ"
  documento: string
  telefone: string
  email: string
  endereco: string
  observacoes?: string
  dataCadastro: string
  status: "Ativo" | "Inativo"
}

// Dados de ilustração removidos.

export default function ClientManagement() {
  // O estado agora é inicializado como um array vazio.
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const filteredClients = clients.filter(
    (client) =>
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.documento.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSaveClient = (clientData: any) => {
    const newClient: Client = {
        // Geração de ID simples (em um app real, isso viria do backend)
      id: `CLI${Date.now()}`,
      nome: clientData.nome,
      tipo: clientData.tipo,
      documento: clientData.documento,
      telefone: clientData.telefone,
      email: clientData.email || "",
      endereco: `${clientData.rua}, ${clientData.numero}${clientData.complemento ? `, ${clientData.complemento}` : ""} - ${clientData.bairro}, ${clientData.cidade}/${clientData.estado}`,
      observacoes: clientData.observacoes,
      dataCadastro: new Date().toISOString().split("T")[0], // Data atual
      status: "Ativo",
    }

    setClients([...clients, newClient])

    if (clientData.criarOS) {
      alert(
        `Cliente cadastrado com sucesso! OS criada para ${clientData.tipoMaquina} ${clientData.marca} ${clientData.modelo}`,
      )
    }
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter((client) => client.id !== clientId))
  }
  
  // Componente para estado vazio
  const EmptyState = () => (
    <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
        <UsersIcon className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum Cliente Cadastrado</h3>
        <p className="mt-2 text-sm">Clique em "Novo Cliente" para começar a adicionar seus clientes.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Cadastre e gerencie informações dos seus clientes</p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button size="lg" className="rounded-full w-14 h-14 shadow-lg" onClick={() => setIsWizardOpen(true)}>
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, documento ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                disabled={clients.length === 0} // Desabilita a busca se não há clientes
              />
            </div>
            <Button variant="outline" disabled={clients.length === 0}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredClients.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados ({filteredClients.length})</CardTitle>
            <CardDescription>Lista de todos os clientes cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {client.tipo === "PF" ? (
                        <User className="w-5 h-5 text-primary" />
                      ) : (
                        <Building className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate" title={client.nome}>{client.nome}</h3>
                        <Badge variant="outline">{client.tipo}</Badge>
                        <Badge
                          className={
                            client.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {client.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1 truncate">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.telefone}</span>
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                           <span className="truncate">{client.email}</span>
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                           <span className="truncate">{client.endereco}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => console.log("Edit client")}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState />
      )}

      <ClientWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onSave={handleSaveClient} />
    </div>
  )
}
