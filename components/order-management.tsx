'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/lib/hooks/use-debounce"

// Interfaces (mantidas como estão)
interface Client {
  id: string;
  nome: string;
}

interface ServiceOrder {
  id: string;
  orderNumber: string;
  client: Client;
  equipment: string;
  brand?: string;
  model?: string;
  problem: string;
  status: string;
  estimatedValue?: number;
  observations?: string;
  createdAt: string;
}

interface FormData {
  clientId: string;
  equipment: string;
  brand: string;
  model: string;
  problem: string;
  observations: string;
  estimatedValue: number;
}

const initialFormData: FormData = {
  clientId: "",
  equipment: "",
  brand: "",
  model: "",
  problem: "",
  observations: "",
  estimatedValue: 0,
};

const STATUS_COLORS: Record<string, string> = {
  "Rascunho": "bg-gray-200 text-gray-800",
  "Orçamento Gerado": "bg-blue-100 text-blue-800",
  "Aguardando Aprovação": "bg-yellow-100 text-yellow-800",
  "Aprovado": "bg-green-200 text-green-900",
  "Em Execução": "bg-purple-100 text-purple-800",
  "Concluído": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

function OrderManagement() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- Estados de Paginação ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10; // Itens por página

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // --- Busca de Dados Paginados ---
  const fetchData = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const ordersUrl = `/api/orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      const clientsUrl = "/api/clients"; // Clientes ainda são buscados todos de uma vez
      
      const [ordersRes, clientsRes] = await Promise.all([
        fetch(ordersUrl),
        fetch(clientsUrl),
      ]);

      if (!ordersRes.ok || !clientsRes.ok) {
        throw new Error("Falha ao buscar dados do servidor");
      }

      const [ordersData, clientsData] = await Promise.all([
        ordersRes.json(),
        clientsRes.json(),
      ]);

      setOrders(ordersData.data || []);
      setTotalOrders(ordersData.total || 0);
      setTotalPages(ordersData.totalPages || 1);
      setCurrentPage(ordersData.page || 1);
      setClients(clientsData || []);

    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchData]);

  const getStatusColor = useCallback((status: string) => 
    STATUS_COLORS[status] || "bg-gray-100 text-gray-800"
  , []);

  // --- Funções do formulário (sem alterações significativas) ---
  const handleInputChange = useCallback((field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setEditingOrder(null);
    setFormData(initialFormData);
    setIsDialogOpen(false);
  }, []);

  const handleSaveOrder = useCallback(async () => {
    if (!formData.clientId || !formData.equipment || !formData.problem) {
      toast.error("Preencha os campos obrigatórios: Cliente, Equipamento e Problema");
      return;
    }
    try {
      const method = editingOrder ? "PUT" : "POST";
      const url = editingOrder ? `/api/orders/${editingOrder.id}` : "/api/orders";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Falha ao salvar a ordem de serviço");

      toast.success(`Ordem de serviço ${editingOrder ? 'atualizada' : 'criada'} com sucesso!`);
      resetForm();
      fetchData(currentPage, debouncedSearchTerm); // Recarrega os dados da página atual
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    }
  }, [formData, editingOrder, resetForm, fetchData, currentPage, debouncedSearchTerm]);
  
  const handleEditClick = useCallback((order: ServiceOrder) => {
    setEditingOrder(order);
    setFormData({
      clientId: order.client.id,
      equipment: order.equipment,
      brand: order.brand || "",
      model: order.model || "",
      problem: order.problem,
      observations: order.observations || "",
      estimatedValue: order.estimatedValue || 0,
    });
    setIsDialogOpen(true);
  }, []);

  const handleNewClick = useCallback(() => {
    setEditingOrder(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const EmptyState = () => (
    <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
      <FileSpreadsheet className="mx-auto h-12 w-12" />
      <h3 className="mt-4 text-lg font-semibold">Nenhuma Ordem de Serviço Encontrada</h3>
      <p className="mt-2 text-sm">{totalOrders > 0 ? "Tente um termo de busca diferente." : 'Clique em "Nova OS" para criar a primeira.'}</p>
    </div>
  );

  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-muted-foreground">
        Mostrando {orders.length} de {totalOrders} ordens.
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
        >
          Anterior
        </Button>
        <span className="text-sm font-medium">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie todas as ordens de serviço da sua empresa</p>
        </div>
        <Button onClick={handleNewClick}>
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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                      <p className="font-medium text-primary truncate">{order.orderNumber}</p>
                      <p className="text-sm font-semibold truncate">{order.client.nome}</p>
                      <p className="text-sm text-muted-foreground truncate">{order.equipment}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Problema: {order.problem}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEditClick(order)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <PaginationControls />
          </CardContent>
        </Card>
      ) : (
        <EmptyState />
      )}

      {/* Modal de Edição/Criação (sem alterações) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações para a ordem de serviço.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">Cliente *</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equipment" className="text-right">Equipamento *</Label>
              <Input 
                id="equipment" 
                value={formData.equipment} 
                onChange={(e) => handleInputChange("equipment", e.target.value)} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Marca</Label>
              <Input 
                id="brand" 
                value={formData.brand} 
                onChange={(e) => handleInputChange("brand", e.target.value)} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">Modelo</Label>
              <Input 
                id="model" 
                value={formData.model} 
                onChange={(e) => handleInputChange("model", e.target.value)} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="problem" className="text-right">Problema *</Label>
              <Textarea 
                id="problem" 
                value={formData.problem} 
                onChange={(e) => handleInputChange("problem", e.target.value)} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observations" className="text-right">Observações</Label>
              <Textarea 
                id="observations" 
                value={formData.observations} 
                onChange={(e) => handleInputChange("observations", e.target.value)} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimatedValue" className="text-right">Valor Estimado</Label>
              <Input 
                id="estimatedValue" 
                type="number" 
                value={formData.estimatedValue} 
                onChange={(e) => handleInputChange("estimatedValue", parseFloat(e.target.value) || 0)} 
                className="col-span-3" 
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOrder}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrderManagement;