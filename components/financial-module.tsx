'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, AlertCircle, CheckCircle, Clock, Search, Download, Eye, Send, Loader2, FileSpreadsheet, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"

// Interfaces
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

const FinancialModule = () => {
  const [billings, setBillings] = useState<Billing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBillings, setTotalBillings] = useState(0)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null)

  const fetchBillings = useCallback(async (currentPage: number, search: string, status: string) => {
    setIsLoading(true)
    try {
      const url = `/api/financial/billings?page=${currentPage}&limit=10&search=${encodeURIComponent(search)}&status=${status}`
      const response = await fetch(url)
      if (!response.ok) throw new Error("Falha ao buscar faturas")
      const data = await response.json()
      setBillings(data.data || [])
      setTotalBillings(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setPage(data.page || 1)
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível carregar as faturas. Tente novamente.")
      setBillings([])
      setTotalBillings(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBillings(page, debouncedSearchTerm, statusFilter)
  }, [page, debouncedSearchTerm, statusFilter, fetchBillings])

  const getStatusColor = (status: string) => { /* ... (implementação mantida) */ }
  const getStatusIcon = (status: string) => { /* ... (implementação mantida) */ }
  const getTipoColor = (tipo: string) => { /* ... (implementação mantida) */ }

  // DADOS DOS CARDS AGORA SÃO APENAS VISUAIS ATÉ A API DE STATS ESTAR PRONTA
  const totals = {
    total: 0,
    pago: 0,
    pendente: 0,
    vencido: 0,
    diagnosticoTotal: 0,
  }

  const handleViewDetails = (billing: Billing) => {
    setSelectedBilling(billing)
    setIsDialogOpen(true)
  }

  const BillingRowSkeleton = () => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
        </div>
    </div>
  );

  const EmptyState = () => (
    <Card className="mt-4">
        <CardContent className="pt-6">
            <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg">
                <FileSpreadsheet className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma Fatura Encontrada</h3>
                <p className="mt-2 text-sm">{totalBillings > 0 ? "Tente um filtro ou busca diferente." : 'Nenhuma cobrança registrada ainda.'}</p>
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
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

      {/* Cards de Resumo - Usando Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-3 w-1/3 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por fatura, cliente ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Todos os Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      {/* Lista de Cobranças */}
      {isLoading ? (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => <BillingRowSkeleton key={i} />)}
        </div>
      ) : billings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Cobranças e Faturas ({totalBillings})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billings.map((billing) => (
                <div key={billing.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  {/* ... (Renderização da linha da fatura mantida) */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState />
      )}
      
      {totalPages > 1 && !isLoading && (
         <div className="flex items-center justify-center space-x-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium">Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      )}

      {/* Modal de Detalhes (sem alterações) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* ... (Conteúdo do modal mantido) */}
      </Dialog>
    </div>
  )
}

export default FinancialModule
