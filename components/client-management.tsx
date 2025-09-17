'use client'

import { useState, useEffect, useCallback, memo } from "react"
import { z } from "zod"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, User, Building, Phone, FileText, MapPin, Users as UsersIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { ClientWizard, type SaveData } from "./client-wizard"
import { Skeleton } from "@/components/ui/skeleton"
import { Client } from "@/types/client"

const EmptyState = memo(() => (
  <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
    <UsersIcon className="mx-auto h-12 w-12" />
    <h3 className="mt-4 text-lg font-semibold">Nenhum Cliente Encontrado</h3>
    <p className="mt-2 text-sm">Tente ajustar sua busca ou adicione um novo cliente.</p>
  </div>
));

const ClientCardSkeleton = memo(() => (
  <div className="flex items-start justify-between p-4 border rounded-lg">
    <div className="flex items-start gap-4 min-w-0 flex-1">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex flex-col min-w-0 flex-1 gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-60" />
        <Skeleton className="h-4 w-52" />
      </div>
    </div>
    <div className="flex flex-col sm:flex-row items-center gap-2 ml-4 flex-shrink-0">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
));

const ClientCard = memo(({ client, onEdit, onDelete }: { client: Client; onEdit: (client: Client) => void; onDelete: (id: string) => void }) => (
  <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <div className="flex items-start gap-4 min-w-0 flex-1">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
        {client.tipo === "PF" ? <User className="w-5 h-5 text-primary" /> : <Building className="w-5 h-5 text-primary" />}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium truncate" title={client.nome}>{client.nome}</h3>
          <Badge variant="outline">{client.tipo}</Badge>
          <Badge className={client.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{client.status}</Badge>
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" /><span>{client.telefone}</span></span>
          <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 flex-shrink-0" /><span>{client.documento}</span></span>
          {client.tipo === 'PJ' && client.inscricaoEstadual && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 flex-shrink-0" /><span>IE: {client.inscricaoEstadual}</span></span>}
          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 flex-shrink-0" /><span>{`${client.rua}, ${client.numero}, ${client.bairro} - ${client.cidade}/${client.estado}`}</span></span>
        </div>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row items-center gap-2 ml-4 flex-shrink-0">
      <Button variant="outline" size="sm" onClick={() => onEdit(client)}><Edit className="w-4 h-4" /></Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(client.id)}><Trash2 className="w-4 h-4" /></Button>
    </div>
  </div>
));

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchClients = useCallback(async (currentPage: number, search: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clients?page=${currentPage}&pageSize=10&search=${search}`);
      if (!response.ok) throw new Error('Falha ao buscar clientes');
      const data = await response.json();
      setClients(data.clients || []);
      setTotalPages(data.totalPages || 1);
      setTotalClients(data.totalClients || 0);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os clientes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm, fetchClients]);

  const handleSaveClient = useCallback(async (saveData: SaveData) => {
    setIsSaving(true);
    const { clientData, osData } = saveData;
    const isEditing = !!clientToEdit?.id;

    const promise = async () => {
        const clientResponse = await fetch(isEditing ? `/api/clients/${clientToEdit.id}` : '/api/clients', {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData),
        });

        const clientResult = await clientResponse.json();
        if (!clientResponse.ok) {
            throw new Error(clientResult.error || (isEditing ? 'Falha ao atualizar cliente.' : 'Falha ao cadastrar cliente.'));
        }

        if (osData) {
            toast.loading("Criando Ordem de Serviço...");
            const newClientId = clientResult.id;
            const osPayload = { ...osData, clientId: newClientId };

            const osResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(osPayload),
            });

            if (!osResponse.ok) {
                const osErrorResult = await osResponse.json();
                throw new Error(`Cliente salvo, mas falha ao criar OS: ${osErrorResult.error || 'Erro desconhecido'}`);
            }
        }
        return clientResult;
    };

    toast.promise(promise(), {
      loading: isEditing ? 'Atualizando cliente...' : 'Cadastrando novo cliente...',
      success: () => {
        fetchClients(isEditing ? page : 1, '');
        if (!isEditing) { 
            setSearchTerm(''); 
            setPage(1);
        }
        setIsWizardOpen(false);
        return osData ? "Cliente e OS criados com sucesso!" : (isEditing ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
      },
      error: (err) => err.message || 'Ocorreu um erro inesperado.',
      finally: () => setIsSaving(false),
    });
  }, [clientToEdit, fetchClients, page]);

  const handleDeleteClient = useCallback(async (clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente e todas as suas ordens de serviço associadas?")) {
        const promise = fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
        toast.promise(promise, {
            loading: 'Excluindo cliente...',
            success: (res) => {
                if (!res.ok) throw new Error('Falha ao excluir.');
                fetchClients(page, debouncedSearchTerm);
                return 'Cliente excluído com sucesso!';
            },
            error: 'Não foi possível excluir o cliente.',
        });
    }
  }, [page, debouncedSearchTerm, fetchClients]);

  const handleAddNewClient = useCallback(() => {
    setClientToEdit(null);
    setIsWizardOpen(true);
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    setClientToEdit(client);
    setIsWizardOpen(true);
  }, []);

  const handleCloseWizard = useCallback(() => {
    setIsWizardOpen(false);
    setTimeout(() => setClientToEdit(null), 300);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Cadastre e gerencie informações dos seus clientes</p>
        </div>
        <Button onClick={handleAddNewClient} className="hidden md:flex"><Plus className="w-4 h-4 mr-2" />Novo Cliente</Button>
      </div>

      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button size="lg" className="rounded-full w-14 h-14 shadow-lg" onClick={handleAddNewClient}><Plus className="w-6 h-6" /></Button>
      </div>

      <Card>
        <CardContent className="pt-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10"
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados ({totalClients})</CardTitle>
          <CardDescription>Lista de todos os clientes cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <ClientCardSkeleton key={i} />)}</div>
          ) : clients.length > 0 ? (
            <div className="space-y-4">{clients.map((client) => (<ClientCard key={client.id} client={client} onEdit={handleEditClient} onDelete={handleDeleteClient} />))}</div>
          ) : <EmptyState />}
        </CardContent>
      </Card>

      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      )}

      <ClientWizard 
        isOpen={isWizardOpen} 
        onClose={handleCloseWizard} 
        onSave={handleSaveClient}
        isSaving={isSaving}
        clientToEdit={clientToEdit}
      />
    </div>
  )
}

EmptyState.displayName = 'EmptyState';
ClientCard.displayName = 'ClientCard';
ClientCardSkeleton.displayName = 'ClientCardSkeleton';
