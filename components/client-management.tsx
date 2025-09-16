'use client'

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { z } from "zod"
import { ClientSchema } from "@/lib/validators"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, User, Building, Phone, FileText, MapPin, Users as UsersIcon } from "lucide-react"
import { ClientWizard } from "./client-wizard"

interface Client extends z.infer<typeof ClientSchema> {
  id: string
  status: "Ativo" | "Inativo"
  dataCadastro: string
}

const LOCAL_STORAGE_KEY = 'clients'

const EmptyState = memo(() => (
  <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
    <UsersIcon className="mx-auto h-12 w-12" />
    <h3 className="mt-4 text-lg font-semibold">Nenhum Cliente Cadastrado</h3>
    <p className="mt-2 text-sm">Clique em "Novo Cliente" para começar a adicionar seus clientes.</p>
  </div>
))

const ClientCard = memo(({ client, onDelete }: { client: Client; onDelete: (id: string) => void }) => (
  <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <div className="flex items-start gap-4 min-w-0 flex-1">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
        {client.tipo === "PF" ? (
          <User className="w-5 h-5 text-primary" />
        ) : (
          <Building className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium truncate" title={client.nome}>
            {client.nome}
          </h3>
          <Badge variant="outline">{client.tipo}</Badge>
          <Badge
            className={
              client.status === "Ativo" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }
          >
            {client.status}
          </Badge>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>{client.telefone}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span>{client.documento}</span>
          </span>
          {client.tipo === 'PJ' && client.inscricaoEstadual && (
            <span className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 flex-shrink-0" />
              <span>IE: {client.inscricaoEstadual}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>
              {`${client.rua}, ${client.numero}, ${client.bairro} - ${client.cidade}/${client.estado}`}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row items-center gap-2 ml-4 flex-shrink-0">
      <Button variant="outline" size="sm">
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(client.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </div>
))

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const saveClients = useCallback((clientsData: Client[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clientsData))
    } catch (error) {
      console.error("Falha ao salvar dados de clientes:", error)
    }
  }, [])

  const loadClients = useCallback(() => {
    try {
      const savedClients = localStorage.getItem(LOCAL_STORAGE_KEY)
      return savedClients ? JSON.parse(savedClients) : []
    } catch (error) {
      console.error("Falha ao ler dados de clientes:", error)
      return []
    }
  }, [])

  useEffect(() => {
    setClients(loadClients())
  }, [loadClients])

  useEffect(() => {
    if (clients.length > 0) {
      saveClients(clients)
    }
  }, [clients, saveClients])

  const filteredClients = useMemo(() => 
    clients.filter((client) =>
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.documento.includes(searchTerm)
    ), [clients, searchTerm]
  )

  const handleSaveClient = useCallback((clientData: z.infer<typeof ClientSchema>) => {
    const newClient: Client = {
      ...clientData,
      id: `CLI${Date.now()}`,
      dataCadastro: new Date().toISOString().split("T")[0],
      status: "Ativo",
    }

    setClients(prevClients => [...prevClients, newClient])

    if (clientData.criarOS) {
      console.log(
        `OS criada para ${clientData.tipoMaquina} ${clientData.marca} ${clientData.modelo}`
      )
    }

    setIsWizardOpen(false)
  }, [])

  const handleDeleteClient = useCallback((clientId: string) => {
    setClients(prevClients => prevClients.filter(client => client.id !== clientId))
  }, [])

  const handleOpenWizard = useCallback(() => {
    setIsWizardOpen(true)
  }, [])

  const handleCloseWizard = useCallback(() => {
    setIsWizardOpen(false)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const hasClients = clients.length > 0
  const hasFilteredClients = filteredClients.length > 0

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Cadastre e gerencie informações dos seus clientes</p>
        </div>
        <Button onClick={handleOpenWizard} className="hidden md:flex">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 shadow-lg" 
          onClick={handleOpenWizard}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou documento..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
                disabled={!hasClients}
              />
            </div>
            <Button variant="outline" disabled={!hasClients}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasFilteredClients ? (
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados ({filteredClients.length})</CardTitle>
            <CardDescription>Lista de todos os clientes cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  onDelete={handleDeleteClient} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState />
      )}

      <ClientWizard 
        isOpen={isWizardOpen} 
        onClose={handleCloseWizard} 
        onSave={handleSaveClient} 
      />
    </div>
  )
}

EmptyState.displayName = 'EmptyState'
ClientCard.displayName = 'ClientCard'