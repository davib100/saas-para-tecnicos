'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, FileSpreadsheet, Loader2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"

// Interfaces
interface Client {
  id: string;
  nome: string;
}

interface ServiceOrder {
  id: string;
  orderNumber: string;
  client: Client;
  equipment: string;
  brand: string | null;
  model: string | null;
  problem: string;
  status: string;
  estimatedValue: number | null;
  observations: string | null;
  createdAt: string;
}

interface FormData {
  clientId: string;
  equipment: string;
  brand: string;
  model: string;
  problem: string;
  status: string;
  observations: string;
  estimatedValue: string;
}

const initialFormData: FormData = {
  clientId: "",
  equipment: "",
  brand: "",
  model: "",
  problem: "",
  status: "Rascunho",
  observations: "",
  estimatedValue: "",
};

const STATUS_OPTIONS = [
  "Rascunho", "Orçamento Gerado", "Aguardando Aprovação", 
  "Aprovado", "Em Execução", "Concluído", "Cancelado"
];

const STATUS_COLORS: Record<string, string> = {
  "Rascunho": "bg-gray-200 text-gray-800",
  "Orçamento Gerado": "bg-blue-100 text-blue-800",
  "Aguardando Aprovação": "bg-yellow-100 text-yellow-800",
  "Aprovado": "bg-green-200 text-green-900",
  "Em Execução": "bg-purple-100 text-purple-800",
  "Concluído": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

const OrderRowSkeleton = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );

export default function OrderManagement() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const fetchOrders = useCallback(async (currentPage: number, search: string) => {
    setIsLoading(true);
    try {
      const url = `/api/orders?page=${currentPage}&limit=10&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao buscar ordens de serviço");
      const data = await response.json();
      setOrders(data.data || []);
      setTotalOrders(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar as ordens. Tente novamente.");
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    if (clients.length > 0) return; // Evita buscar se já tiverem sido carregados
    try {
      const response = await fetch('/api/clients?all=true'); // Usar um endpoint que retorna todos os clientes
      if (!response.ok) throw new Error("Falha ao buscar clientes");
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar a lista de clientes.");
    }
  }, [clients.length]);

  useEffect(() => {
    fetchOrders(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchOrders]);

  useEffect(() => {
    fetchOrders(page, debouncedSearchTerm);
}, [page]);

  const getStatusColor = (status: string) => STATUS_COLORS[status] || "bg-gray-100 text-gray-800";

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveOrder = async () => {
    if (!formData.clientId || !formData.equipment || !formData.problem) {
      toast.error("Preencha os campos obrigatórios: Cliente, Equipamento e Problema");
      return;
    }
    setIsSaving(true);
    try {
      const method = editingOrder ? "PUT" : "POST";
      const url = editingOrder ? `/api/orders/${editingOrder.id}` : "/api/orders";
      const payload = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
      };
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Falha ao ${editingOrder ? 'atualizar' : 'criar'} a ordem`);

      toast.success(`Ordem de serviço ${editingOrder ? 'atualizada' : 'criada'} com sucesso!`);
      setIsDialogOpen(false);
      fetchOrders(page, debouncedSearchTerm); // Recarrega os dados da página atual
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta ordem de serviço?")) return;
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (response.status !== 204) throw new Error("Falha ao deletar a ordem de serviço");
      toast.success("Ordem de serviço deletada com sucesso!");
      fetchOrders(page, debouncedSearchTerm);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    }
  };
  
  const openDialog = useCallback((order: ServiceOrder | null) => {
    fetchClients(); // Busca clientes ao abrir o modal
    if (order) {
        setEditingOrder(order);
        setFormData({
            clientId: order.client.id,
            equipment: order.equipment,
            brand: order.brand || "",
            model: order.model || "",
            problem: order.problem,
            status: order.status,
            observations: order.observations || "",
            estimatedValue: order.estimatedValue?.toString() || "",
        });
    } else {
        setEditingOrder(null);
        setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  }, [fetchClients]);

  const EmptyState = () => (
    <Card className="mt-4">
        <CardContent className="pt-6">
            <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg">
                <FileSpreadsheet className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma Ordem de Serviço Encontrada</h3>
                <p className="mt-2 text-sm">{totalOrders > 0 ? "Tente um termo de busca diferente." : 'Clique em "Nova OS" para criar a primeira.'}</p>
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie todas as ordens de serviço da sua empresa</p>
        </div>
        <Button onClick={() => openDialog(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova OS
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por OS, cliente ou equipamento..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10" 
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {[...Array(5)].map((_, i) => <OrderRowSkeleton key={i} />)}
            </CardContent>
        </Card>
      ) : orders.length > 0 ? (
        <Card>
          <CardContent className="pt-0">
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                      <p className="font-medium text-primary truncate">{order.orderNumber}</p>
                      <p className="text-sm font-semibold truncate">{order.client.nome}</p>
                      <p className="text-sm text-muted-foreground truncate">{order.equipment}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">Problema: {order.problem}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <Button variant="outline" size="icon" onClick={() => openDialog(order)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState />
      )}

      {totalPages > 1 && (
         <div className="flex items-center justify-center space-x-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium">Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{editingOrder ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</DialogTitle>
                <DialogDescription>Preencha as informações para a ordem de serviço.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {/* Form fields */}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveOrder} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
