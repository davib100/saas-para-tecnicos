'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, FileText, TrendingUp, DollarSign, Package, AlertTriangle } from "lucide-react"
import { useState, useMemo } from "react"
import { ExcelExportModal } from "./excel-export-modal"

// Helper para evitar divisão por zero
const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return parseFloat(((value / total) * 100).toFixed(1))
}

// Estado inicial zerado
const initialReportStats = {
  osAbertas: 0,
  osConcluidas: 0,
  orcamentosAceitos: 0,
  orcamentosRecusados: 0,
  faturamentoTotal: 0,
  ticketMedio: 0,
  clientesAtivos: 0,
  novosClientes: 0,
  itensEmEstoque: 0,
  itensUtilizados: 0,
}

const EmptyReportState = () => (
  <Card>
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatório Mensal
        </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center justify-center text-center p-10">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Nenhum dado para exibir</h3>
        <p className="text-sm text-muted-foreground">Ainda não há dados suficientes para gerar os relatórios. Comece a criar ordens de serviço.</p>
    </CardContent>
  </Card>
)

const ReportsModule = () => {
  // No futuro, estes dados viriam de uma API
  const [reportStats, setReportStats] = useState(initialReportStats)
  const [showExportModal, setShowExportModal] = useState(false)

  // Verifica se há algum dado para exibir
  const hasData = useMemo(() => Object.values(reportStats).some(value => value > 0), [reportStats])

  // Cálculos derivados
  const taxaConclusaoOS = calculatePercentage(reportStats.osConcluidas, reportStats.osAbertas)
  const totalOrcamentos = reportStats.orcamentosAceitos + reportStats.orcamentosRecusados
  const taxaAceitacaoOrcamentos = calculatePercentage(reportStats.orcamentosAceitos, totalOrcamentos)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análises e estatísticas do seu negócio</p>
        </div>
        <Button onClick={() => setShowExportModal(true)} disabled={!hasData}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {!hasData ? (
        <EmptyReportState />
      ) : (
        <>
          {/* Relatório Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Relatório Mensal
              </CardTitle>
              <CardDescription>Resumo das atividades e performance do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* OS Stats */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /><span className="text-sm font-medium">Ordens de Serviço</span></div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Abertas:</span><span className="font-medium">{reportStats.osAbertas}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Concluídas:</span><span className="font-medium">{reportStats.osConcluidas}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Taxa de conclusão:</span><Badge className="bg-green-100 text-green-800">{taxaConclusaoOS}%</Badge></div>
                    </div>
                </div>
                {/* Orçamentos Stats */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /><span className="text-sm font-medium">Orçamentos</span></div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Aceitos:</span><span className="font-medium">{reportStats.orcamentosAceitos}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Recusados:</span><span className="font-medium">{reportStats.orcamentosRecusados}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Taxa de aceitação:</span><Badge className="bg-blue-100 text-blue-800">{taxaAceitacaoOrcamentos}%</Badge></div>
                    </div>
                </div>
                 {/* Financeiro Stats */}
                 <div className="space-y-2">
                    <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-600" /><span className="text-sm font-medium">Financeiro</span></div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Faturamento:</span><span className="font-medium">R$ {reportStats.faturamentoTotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Ticket médio:</span><span className="font-medium">R$ {reportStats.ticketMedio.toFixed(2)}</span></div>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outros Relatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Clientes</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Clientes ativos:</span><span className="font-medium">{reportStats.clientesAtivos}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Novos clientes (mês):</span><span className="font-medium">{reportStats.novosClientes}</span></div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Estoque</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Itens em estoque:</span><span className="font-medium">{reportStats.itensEmEstoque}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Itens utilizados (mês):</span><span className="font-medium">{reportStats.itensUtilizados}</span></div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      <ExcelExportModal open={showExportModal} onOpenChange={setShowExportModal} />
    </div>
  )
}

export default ReportsModule
