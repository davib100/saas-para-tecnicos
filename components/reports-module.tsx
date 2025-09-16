'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, FileText, TrendingUp, DollarSign, AlertTriangle } from "lucide-react"
import { useState, useMemo, memo, useEffect, useCallback } from "react"
import { ExcelExportModal } from "./excel-export-modal"

interface ReportStats {
  osAbertas: number
  osConcluidas: number
  orcamentosAceitos: number
  orcamentosRecusados: number
  faturamentoTotal: number
  ticketMedio: number
  clientesAtivos: number
  novosClientes: number
  itensEmEstoque: number
  itensUtilizados: number
}

const calculatePercentage = (value: number, total: number): number => {
  return total === 0 ? 0 : parseFloat(((value / total) * 100).toFixed(1))
}

const sampleReportStats: ReportStats = {
  osAbertas: 25,
  osConcluidas: 18,
  orcamentosAceitos: 22,
  orcamentosRecusados: 3,
  faturamentoTotal: 12540.50,
  ticketMedio: 696.69,
  clientesAtivos: 42,
  novosClientes: 5,
  itensEmEstoque: 153,
  itensUtilizados: 34,
}

const EmptyReportState = memo(() => (
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
))

const StatCard = memo(({ title, icon: Icon, color, children }: {
  title: string
  icon: any
  color: string
  children: React.ReactNode
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm font-medium">{title}</span>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
))

const StatRow = memo(({ label, value, isBadge = false, badgeColor = "" }: {
  label: string
  value: string | number
  isBadge?: boolean
  badgeColor?: string
}) => (
  <div className="flex justify-between">
    <span className="text-sm text-muted-foreground">{label}:</span>
    {isBadge ? (
      <Badge className={badgeColor}>{value}%</Badge>
    ) : (
      <span className="font-medium">{value}</span>
    )}
  </div>
))

const ReportsModule = () => {
  const [reportStats, setReportStats] = useState<ReportStats>(sampleReportStats)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('reportStats')
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats)
        setReportStats(parsedStats)
      } else {
        localStorage.setItem('reportStats', JSON.stringify(sampleReportStats))
      }
    } catch (error) {
      console.error("Falha ao ler dados de relatórios:", error)
    }
  }, [])

  const hasData = useMemo(() => 
    Object.values(reportStats).some(value => value > 0), 
    [reportStats]
  )

  const taxaConclusaoOS = useMemo(() => 
    calculatePercentage(reportStats.osConcluidas, reportStats.osAbertas), 
    [reportStats.osConcluidas, reportStats.osAbertas]
  )

  const totalOrcamentos = useMemo(() => 
    reportStats.orcamentosAceitos + reportStats.orcamentosRecusados, 
    [reportStats.orcamentosAceitos, reportStats.orcamentosRecusados]
  )

  const taxaAceitacaoOrcamentos = useMemo(() => 
    calculatePercentage(reportStats.orcamentosAceitos, totalOrcamentos), 
    [reportStats.orcamentosAceitos, totalOrcamentos]
  )

  const handleExportClick = useCallback(() => {
    setShowExportModal(true)
  }, [])

  const handleExportModalChange = useCallback((open: boolean) => {
    setShowExportModal(open)
  }, [])

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análises e estatísticas do seu negócio</p>
          </div>
          <Button disabled>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
        <EmptyReportState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análises e estatísticas do seu negócio</p>
        </div>
        <Button onClick={handleExportClick}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatório Mensal
          </CardTitle>
          <CardDescription>Resumo das atividades e performance do mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Ordens de Serviço" icon={FileText} color="text-blue-600">
              <StatRow label="Abertas" value={reportStats.osAbertas} />
              <StatRow label="Concluídas" value={reportStats.osConcluidas} />
              <StatRow 
                label="Taxa de conclusão" 
                value={taxaConclusaoOS} 
                isBadge 
                badgeColor="bg-green-100 text-green-800" 
              />
            </StatCard>

            <StatCard title="Orçamentos" icon={DollarSign} color="text-green-600">
              <StatRow label="Aceitos" value={reportStats.orcamentosAceitos} />
              <StatRow label="Recusados" value={reportStats.orcamentosRecusados} />
              <StatRow 
                label="Taxa de aceitação" 
                value={taxaAceitacaoOrcamentos} 
                isBadge 
                badgeColor="bg-blue-100 text-blue-800" 
              />
            </StatCard>

            <StatCard title="Financeiro" icon={TrendingUp} color="text-purple-600">
              <StatRow label="Faturamento" value={`R$ ${reportStats.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <StatRow label="Ticket médio" value={`R$ ${reportStats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            </StatCard>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Clientes ativos" value={reportStats.clientesAtivos} />
            <StatRow label="Novos clientes (mês)" value={reportStats.novosClientes} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Itens em estoque" value={reportStats.itensEmEstoque} />
            <StatRow label="Itens utilizados (mês)" value={reportStats.itensUtilizados} />
          </CardContent>
        </Card>
      </div>
      
      <ExcelExportModal open={showExportModal} onOpenChange={handleExportModalChange} />
    </div>
  )
}

export default ReportsModule