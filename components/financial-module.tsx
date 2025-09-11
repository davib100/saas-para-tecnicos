"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, AlertCircle, CheckCircle, Clock, Search, Download, Eye, Send } from "lucide-react"

interface Billing {
  id: string
  tipo: "diagnostico" | "servico" | "produto"
  osId?: string
  clienteId: string
  clienteNome: string
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento?: string
  status: "Pendente" | "Pago" | "Vencido" | "Cancelado"
  metodoPagamento?: string
  observacoes?: string
  dataCriacao: string
}

const mockBillings: Billing[] = [
  {
    id: "FAT001",
    tipo: "diagnostico",
    osId: "OS001",
    clienteId: "CLI001",
    clienteNome: "João Silva",
    descricao: "Taxa de diagnóstico - Notebook Dell",
    valor: 60.0,
    dataVencimento: "2024-02-01",
    status: "Pendente",
    dataCriacao: "2024-01-15",
  },
  {
    id: "FAT002",
    tipo: "servico",
    osId: "OS002",
    clienteId: "CLI003",
    clienteNome: "Maria Santos",
    descricao: "Troca de tela - iPhone 12",
    valor: 340.0,
    dataVencimento: "2024-02-10",
    dataPagamento: "2024-01-18",
    status: "Pago",
    metodoPagamento: "Cartão de Crédito",
    dataCriacao: "2024-01-16",
  },
  {
    id: "FAT003",
    tipo: "diagnostico",
    osId: "OS003",
    clienteId: "CLI002",
    clienteNome: "Tech Solutions Ltda",
    descricao: "Taxa de diagnóstico - Recusa de orçamento",
    valor: 60.0,
    dataVencimento: "2024-01-20",
    status: "Vencido",
    dataCriacao: "2024-01-10",
  },
  {
    id: "FAT004",
    tipo: "produto",
    clienteId: "CLI001",
    clienteNome: "João Silva",
    descricao: "Fonte Universal 90W",
    valor: 85.0,
    dataVencimento: "2024-02-05",
    status: "Pendente",
    dataCriacao: "2024-01-12",
  },
]

const FinancialModule = () => {
  const [billings, setBillings] = useState<Billing[]>(mockBillings)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null)

  const filteredBillings = billings.filter((billing) => {
    const matchesSearch =
      billing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.descricao.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || billing.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente":
        return "bg-yellow-100 text-yellow-800"
      case "Pago":
        return "bg-green-100 text-green-800"
      case "Vencido":
        return "bg-red-100 text-red-800"
      case "Cancelado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendente":
        return <Clock className="w-4 h-4" />
      case "Pago":
        return <CheckCircle className="w-4 h-4" />
      case "Vencido":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "diagnostico":
        return "bg-blue-100 text-blue-800"
      case "servico":
        return "bg-purple-100 text-purple-800"
      case "produto":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateTotals = () => {
    const total = billings.reduce((sum, billing) => sum + billing.valor, 0)
    const pago = billings
      .filter((billing) => billing.status === "Pago")
      .reduce((sum, billing) => sum + billing.valor, 0)
    const pendente = billings
      .filter((billing) => billing.status === "Pendente")
      .reduce((sum, billing) => sum + billing.valor, 0)
    const vencido = billings
      .filter((billing) => billing.status === "Vencido")
      .reduce((sum, billing) => sum + billing.valor, 0)

    const diagnosticoTotal = billings
      .filter((billing) => billing.tipo === "diagnostico")
      .reduce((sum, billing) => sum + billing.valor, 0)

    return { total, pago, pendente, vencido, diagnosticoTotal }
  }

  const totals = calculateTotals()

  const handleMarkAsPaid = (billingId: string) => {
    setBillings(
      billings.map((billing) =>
        billing.id === billingId
          ? {
              ...billing,
              status: "Pago" as const,
              dataPagamento: new Date().toISOString().split("T")[0],
              metodoPagamento: "Dinheiro",
            }
          : billing,
      ),
    )
  }

  const handleSendInvoice = (billing: Billing) => {
    // Simular envio de fatura
    console.log("Enviando fatura:", billing.id)
  }

  const handleViewDetails = (billing: Billing) => {
    setSelectedBilling(billing)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Módulo Financeiro</h1>
          <p className="text-muted-foreground">Gerencie cobranças, faturas e pagamentos</p>
        </div>
        <Button>
          <DollarSign className="w-4 h-4 mr-2" />
          Nova Cobrança
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totals.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totals.pago.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {totals.pendente.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totals.vencido.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Em atraso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxas R$ 60,00</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ {totals.diagnosticoTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {billings.filter((b) => b.tipo === "diagnostico").length} cobranças
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por fatura, cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Vencido">Vencido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cobranças */}
      <Card>
        <CardHeader>
          <CardTitle>Cobranças e Faturas ({filteredBillings.length})</CardTitle>
          <CardDescription>Lista de todas as cobranças do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBillings.map((billing) => (
              <div key={billing.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{billing.id}</p>
                        <Badge className={getTipoColor(billing.tipo)}>
                          {billing.tipo === "diagnostico"
                            ? "Diagnóstico"
                            : billing.tipo === "servico"
                              ? "Serviço"
                              : "Produto"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{billing.clienteNome}</p>
                    </div>
                    <div>
                      <p className="text-sm">{billing.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        Vencimento: {new Date(billing.dataVencimento).toLocaleDateString()}
                        {billing.dataPagamento && (
                          <span className="ml-2">
                            | Pago em: {new Date(billing.dataPagamento).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(billing.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(billing.status)}
                      {billing.status}
                    </span>
                  </Badge>
                  <p className="font-medium text-lg">R$ {billing.valor.toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(billing)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {billing.status === "Pendente" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleSendInvoice(billing)}>
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(billing.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {billing.status === "Vencido" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsPaid(billing.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Cobrança - {selectedBilling?.id}</DialogTitle>
            <DialogDescription>Informações completas da cobrança</DialogDescription>
          </DialogHeader>

          {selectedBilling && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informações Gerais</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>ID:</strong> {selectedBilling.id}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {selectedBilling.tipo}
                    </p>
                    <p>
                      <strong>Cliente:</strong> {selectedBilling.clienteNome}
                    </p>
                    <p>
                      <strong>Valor:</strong> R$ {selectedBilling.valor.toFixed(2)}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedBilling.status}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Datas</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Criação:</strong> {new Date(selectedBilling.dataCriacao).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Vencimento:</strong> {new Date(selectedBilling.dataVencimento).toLocaleDateString()}
                    </p>
                    {selectedBilling.dataPagamento && (
                      <p>
                        <strong>Pagamento:</strong> {new Date(selectedBilling.dataPagamento).toLocaleDateString()}
                      </p>
                    )}
                    {selectedBilling.metodoPagamento && (
                      <p>
                        <strong>Método:</strong> {selectedBilling.metodoPagamento}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-sm">{selectedBilling.descricao}</p>
              </div>

              {selectedBilling.osId && (
                <div>
                  <h4 className="font-medium mb-2">Ordem de Serviço</h4>
                  <p className="text-sm">Relacionada à OS: {selectedBilling.osId}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fechar
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Fatura
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FinancialModule
