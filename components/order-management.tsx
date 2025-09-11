"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Eye, FileText, XCircle } from "lucide-react"
import { ResponsibilityTermModal } from "@/components/responsibility-term-modal"
import { useRealtimeData } from "@/lib/hooks/use-realtime-data"
import { useRealtimeContext } from "@/components/realtime-provider"
import { toast } from "sonner"
import { EnhancedErrorBoundary, useErrorBoundary } from "@/components/enhanced-error-boundary"
import { logComponentError } from "@/lib/error-logger"

interface ServiceItem {
  id: string
  descricao: string
  quantidade: number
  preco: number
}

interface ServiceOrder {
  id: string
  clienteId: string
  clienteNome: string
  maquinaId: string
  maquinaNome: string
  problema: string
  itensServico: ServiceItem[]
  valorEstimado: number
  validadeOrcamento: string
  status:
    | "Rascunho"
    | "Orçamento Gerado"
    | "Aguardando Aprovação"
    | "Aprovado"
    | "Em Execução"
    | "Concluído"
    | "Cancelado"
  dataCriacao: string
  dataAtualizacao: string
  observacoes?: string
}

const mockOrders: ServiceOrder[] = [
  {
    id: "OS001",
    clienteId: "CLI001",
    clienteNome: "João Silva",
    maquinaId: "PRD002",
    maquinaNome: "Notebook Dell Inspiron",
    problema: "Não liga, possível problema na fonte",
    itensServico: [
      { id: "1", descricao: "Diagnóstico completo", quantidade: 1, preco: 60.0 },
      { id: "2", descricao: "Troca de fonte", quantidade: 1, preco: 120.0 },
    ],
    valorEstimado: 180.0,
    validadeOrcamento: "2024-02-15",
    status: "Aguardando Aprovação",
    dataCriacao: "2024-01-15",
    dataAtualizacao: "2024-01-15",
  },
  {
    id: "OS002",
    clienteId: "CLI003",
    clienteNome: "Maria Santos",
    maquinaId: "PRD003",
    maquinaNome: "iPhone 12",
    problema: "Tela trincada, touch não funciona",
    itensServico: [
      { id: "1", descricao: "Diagnóstico", quantidade: 1, preco: 60.0 },
      { id: "2", descricao: "Troca de tela", quantidade: 1, preco: 280.0 },
    ],
    valorEstimado: 340.0,
    validadeOrcamento: "2024-02-20",
    status: "Em Execução",
    dataCriacao: "2024-01-14",
    dataAtualizacao: "2024-01-16",
  },
]

const mockClients = [
  { id: "CLI001", nome: "João Silva" },
  { id: "CLI002", nome: "Tech Solutions Ltda" },
  { id: "CLI003", nome: "Maria Santos" },
]

const mockMachines = [
  { id: "PRD002", nome: "Notebook Dell Inspiron", cliente: "João Silva" },
  { id: "PRD003", nome: "iPhone 12", cliente: "Maria Santos" },
  { id: "PRD004", nome: 'TV Samsung 55"', cliente: "Pedro Costa" },
]

function OrderManagement() {
  const { captureError } = useErrorBoundary()

  const {
    data: orders,
    setData: setOrders,
    updateItem: updateOrder,
    addItem: addOrder,
  } = useRealtimeData<ServiceOrder>({
    eventType: "orders",
    initialData: mockOrders,
    onUpdate: (order) => {
      toast.success(`Ordem ${order.id} foi atualizada`)
    },
    onDelete: (id) => {
      toast.info(`Ordem ${id} foi removida`)
    },
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTermModalOpen, setIsTermModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null)
  const [currentOrderForTerm, setCurrentOrderForTerm] = useState<ServiceOrder | null>(null)
  const [formData, setFormData] = useState({
    clienteId: "",
    maquinaId: "",
    problema: "",
    itensServico: [{ id: "1", descricao: "", quantidade: 1, preco: 0 }] as ServiceItem[],
    validadeOrcamento: "",
    observacoes: "",
  })

  useEffect(() => {
    setOrders(mockOrders)
  }, [setOrders])

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.maquinaNome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Rascunho":
        return "bg-gray-100 text-gray-800"
      case "Orçamento Gerado":
        return "bg-blue-100 text-blue-800"
      case "Aguardando Aprovação":
        return "bg-yellow-100 text-yellow-800"
      case "Aprovado":
        return "bg-green-100 text-green-800"
      case "Em Execução":
        return "bg-purple-100 text-purple-800"
      case "Concluído":
        return "bg-green-100 text-green-800"
      case "Cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateTotal = () => {
    return formData.itensServico.reduce((total, item) => total + item.quantidade * item.preco, 0)
  }

  const addServiceItem = () => {
    const newId = String(formData.itensServico.length + 1)
    setFormData({
      ...formData,
      itensServico: [...formData.itensServico, { id: newId, descricao: "", quantidade: 1, preco: 0 }],
    })
  }

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    const updatedItems = formData.itensServico.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setFormData({ ...formData, itensServico: updatedItems })
  }

  const removeServiceItem = (index: number) => {
    if (formData.itensServico.length > 1) {
      const updatedItems = formData.itensServico.filter((_, i) => i !== index)
      setFormData({ ...formData, itensServico: updatedItems })
    }
  }

  const handleSaveOrder = (asDraft = false) => {
    try {
      const valorEstimado = calculateTotal()
      const status = asDraft ? "Rascunho" : "Orçamento Gerado"

      if (editingOrder) {
        const updatedOrder = {
          ...editingOrder,
          ...formData,
          valorEstimado,
          status,
          dataAtualizacao: new Date().toISOString().split("T")[0],
          clienteNome: mockClients.find((c) => c.id === formData.clienteId)?.nome || "",
          maquinaNome: mockMachines.find((m) => m.id === formData.maquinaId)?.nome || "",
        }

        updateOrder(updatedOrder)
        emit("orders:update", updatedOrder)
      } else {
        const newOrder: ServiceOrder = {
          id: `OS${String(orders.length + 1).padStart(3, "0")}`,
          ...formData,
          valorEstimado,
          status,
          dataCriacao: new Date().toISOString().split("T")[0],
          dataAtualizacao: new Date().toISOString().split("T")[0],
          clienteNome: mockClients.find((c) => c.id === formData.clienteId)?.nome || "",
          maquinaNome: mockMachines.find((m) => m.id === formData.maquinaId)?.nome || "",
        }

        addOrder(newOrder)
        emit("orders:create", newOrder)
      }

      if (!asDraft) {
        // Se não é rascunho, abrir modal do termo
        const orderForTerm = {
          ...formData,
          id: editingOrder?.id || `OS${String(orders.length + 1).padStart(3, "0")}`,
          valorEstimado,
          clienteNome: mockClients.find((c) => c.id === formData.clienteId)?.nome || "",
          maquinaNome: mockMachines.find((m) => m.id === formData.maquinaId)?.nome || "",
          status: "Orçamento Gerado" as const,
          dataCriacao: new Date().toISOString().split("T")[0],
          dataAtualizacao: new Date().toISOString().split("T")[0],
        }
        setCurrentOrderForTerm(orderForTerm)
        setIsTermModalOpen(true)
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      logComponentError("OrderManagement", error, {
        action: "handleSaveOrder",
        asDraft,
        formData,
        editingOrder: editingOrder?.id,
      })
      captureError(error instanceof Error ? error : new Error("Failed to save order"))
      toast.error("Erro ao salvar ordem de serviço")
    }
  }

  const resetForm = () => {
    setFormData({
      clienteId: "",
      maquinaId: "",
      problema: "",
      itensServico: [{ id: "1", descricao: "", quantidade: 1, preco: 0 }],
      validadeOrcamento: "",
      observacoes: "",
    })
    setEditingOrder(null)
  }

  const handleEditOrder = (order: ServiceOrder) => {
    setEditingOrder(order)
    setFormData({
      clienteId: order.clienteId,
      maquinaId: order.maquinaId,
      problema: order.problema,
      itensServico: order.itensServico,
      validadeOrcamento: order.validadeOrcamento,
      observacoes: order.observacoes || "",
    })
    setIsDialogOpen(true)
  }

  const handleGenerateQuote = (order: ServiceOrder) => {
    setCurrentOrderForTerm(order)
    setIsTermModalOpen(true)
  }

  const handleRefuseOrder = (orderId: string) => {
    try {
      const orderToUpdate = orders.find((order) => order.id === orderId)
      if (orderToUpdate) {
        const updatedOrder = {
          ...orderToUpdate,
          status: "Cancelado" as const,
          dataAtualizacao: new Date().toISOString().split("T")[0],
        }

        updateOrder(updatedOrder)
        emit("orders:update", updatedOrder)
      }
    } catch (error) {
      logComponentError("OrderManagement", error, {
        action: "handleRefuseOrder",
        orderId,
      })
      captureError(error instanceof Error ? error : new Error("Failed to refuse order"))
      toast.error("Erro ao recusar ordem de serviço")
    }
  }

  const { emit } = useRealtimeContext()

  return (
    <EnhancedErrorBoundary componentName="OrderManagement" maxRetries={3}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Gerencie todas as ordens de serviço da sua empresa</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOrder ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</DialogTitle>
                <DialogDescription>Preencha as informações da ordem de serviço</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="cliente" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cliente">Cliente</TabsTrigger>
                  <TabsTrigger value="maquina">Máquina</TabsTrigger>
                  <TabsTrigger value="problema">Problema</TabsTrigger>
                  <TabsTrigger value="servicos">Serviços</TabsTrigger>
                </TabsList>

                <TabsContent value="cliente" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente</Label>
                    <select
                      id="cliente"
                      className="w-full p-2 border rounded-md"
                      value={formData.clienteId}
                      onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    >
                      <option value="">Selecione um cliente</option>
                      {mockClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </TabsContent>

                <TabsContent value="maquina" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maquina">Máquina/Equipamento</Label>
                    <select
                      id="maquina"
                      className="w-full p-2 border rounded-md"
                      value={formData.maquinaId}
                      onChange={(e) => setFormData({ ...formData, maquinaId: e.target.value })}
                    >
                      <option value="">Selecione uma máquina</option>
                      {mockMachines
                        .filter((machine) => {
                          const selectedClient = mockClients.find((c) => c.id === formData.clienteId)
                          return !formData.clienteId || machine.cliente === selectedClient?.nome
                        })
                        .map((machine) => (
                          <option key={machine.id} value={machine.id}>
                            {machine.nome} - {machine.cliente}
                          </option>
                        ))}
                    </select>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Nova Máquina
                  </Button>
                </TabsContent>

                <TabsContent value="problema" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="problema">Descrição do Problema</Label>
                    <Textarea
                      id="problema"
                      value={formData.problema}
                      onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                      placeholder="Descreva detalhadamente o problema relatado pelo cliente"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Observações adicionais"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="servicos" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Itens de Serviço</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addServiceItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </div>

                    {formData.itensServico.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-6">
                          <Label>Descrição</Label>
                          <Input
                            value={item.descricao}
                            onChange={(e) => updateServiceItem(index, "descricao", e.target.value)}
                            placeholder="Descrição do serviço"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Qtd</Label>
                          <Input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => updateServiceItem(index, "quantidade", Number.parseInt(e.target.value))}
                            min="1"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label>Preço (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.preco}
                            onChange={(e) => updateServiceItem(index, "preco", Number.parseFloat(e.target.value))}
                            placeholder="0,00"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeServiceItem(index)}
                            disabled={formData.itensServico.length === 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Valor Total Estimado:</span>
                        <span className="text-2xl font-bold text-primary">R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="validade">Validade do Orçamento</Label>
                      <Input
                        id="validade"
                        type="date"
                        value={formData.validadeOrcamento}
                        onChange={(e) => setFormData({ ...formData, validadeOrcamento: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="outline" onClick={() => handleSaveOrder(true)}>
                  Salvar como Rascunho
                </Button>
                <Button onClick={() => handleSaveOrder(false)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Orçamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por OS, cliente ou equipamento..."
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

        {/* Lista de Ordens de Serviço */}
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço ({filteredOrders.length})</CardTitle>
            <CardDescription>Lista de todas as ordens de serviço cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.clienteNome}</p>
                      </div>
                      <div>
                        <p className="text-sm">{order.maquinaNome}</p>
                        <p className="text-xs text-muted-foreground">{order.problema}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <p className="font-medium">R$ {order.valorEstimado.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status === "Aguardando Aprovação" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleGenerateQuote(order)}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefuseOrder(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal do Termo de Responsabilidade */}
        <ResponsibilityTermModal
          isOpen={isTermModalOpen}
          onClose={() => setIsTermModalOpen(false)}
          order={currentOrderForTerm}
        />
      </div>
    </EnhancedErrorBoundary>
  )
}

export { OrderManagement }

export default OrderManagement
