"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, User, Building, Phone, Mail, MapPin } from "lucide-react"
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

const mockClients: Client[] = [
  {
    id: "CLI001",
    nome: "João Silva",
    tipo: "PF",
    documento: "123.456.789-00",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    endereco: "Rua das Flores, 123 - São Paulo/SP",
    observacoes: "Cliente preferencial",
    dataCadastro: "2024-01-10",
    status: "Ativo",
  },
  {
    id: "CLI002",
    nome: "Tech Solutions Ltda",
    tipo: "PJ",
    documento: "12.345.678/0001-90",
    telefone: "(11) 88888-8888",
    email: "contato@techsolutions.com",
    endereco: "Av. Paulista, 1000 - São Paulo/SP",
    dataCadastro: "2024-01-08",
    status: "Ativo",
  },
  {
    id: "CLI003",
    nome: "Maria Santos",
    tipo: "PF",
    documento: "987.654.321-00",
    telefone: "(11) 77777-7777",
    email: "maria@email.com",
    endereco: "Rua do Comércio, 456 - São Paulo/SP",
    observacoes: "Sempre traz equipamentos da Apple",
    dataCadastro: "2024-01-05",
    status: "Ativo",
  },
]

function ClientManagement() {
  const [clients, setClients] = useState<Client[]>(mockClients)
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
      id: clientData.id,
      nome: clientData.nome,
      tipo: clientData.tipo,
      documento: clientData.documento,
      telefone: clientData.telefone,
      email: clientData.email || "",
      endereco: `${clientData.rua}, ${clientData.numero}${clientData.complemento ? `, ${clientData.complemento}` : ""} - ${clientData.bairro}, ${clientData.cidade}/${clientData.estado}`,
      observacoes: clientData.observacoes,
      dataCadastro: clientData.dataCadastro,
      status: clientData.status,
    }

    setClients([...clients, newClient])

    // Se criou OS junto, mostrar mensagem
    if (clientData.criarOS) {
      alert(
        `Cliente cadastrado com sucesso! OS criada para ${clientData.tipoMaquina} ${clientData.marca} ${clientData.modelo}`,
      )
    }
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter((client) => client.id !== clientId))
  }

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

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, documento ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados ({filteredClients.length})</CardTitle>
          <CardDescription>Lista de todos os clientes cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {client.tipo === "PF" ? (
                      <User className="w-5 h-5 text-primary" />
                    ) : (
                      <Building className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{client.nome}</h3>
                      <Badge variant="outline">{client.tipo}</Badge>
                      <Badge
                        className={
                          client.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {client.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.telefone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {client.endereco}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => console.log("Edit client")}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ClientWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onSave={handleSaveClient} />
    </div>
  )
}

export { ClientManagement }
