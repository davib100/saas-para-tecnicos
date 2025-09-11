"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, FileText, TrendingUp, DollarSign, Package } from "lucide-react"
import { useState } from "react"
import { ExcelExportModal } from "./excel-export-modal"

const ReportsModule = () => {
  const monthlyStats = {
    osAbertas: 45,
    osConcluidas: 38,
    orcamentosAceitos: 32,
    orcamentosRecusados: 6,
    taxasDiagnostico: 8,
    faturamentoTotal: 15240.5,
    ticketMedio: 401.06,
  }

  const [showExportModal, setShowExportModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análises e estatísticas do seu negócio</p>
        </div>
        <Button onClick={() => setShowExportModal(true)}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Relatório Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatório Mensal - Janeiro 2024
          </CardTitle>
          <CardDescription>Resumo das atividades e performance do mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Ordens de Serviço</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Abertas:</span>
                  <span className="font-medium">{monthlyStats.osAbertas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Concluídas:</span>
                  <span className="font-medium">{monthlyStats.osConcluidas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de conclusão:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {((monthlyStats.osConcluidas / monthlyStats.osAbertas) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Orçamentos</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Aceitos:</span>
                  <span className="font-medium">{monthlyStats.orcamentosAceitos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recusados:</span>
                  <span className="font-medium">{monthlyStats.orcamentosRecusados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de aceitação:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {(
                      (monthlyStats.orcamentosAceitos /
                        (monthlyStats.orcamentosAceitos + monthlyStats.orcamentosRecusados)) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Taxas de Diagnóstico</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cobranças:</span>
                  <span className="font-medium">{monthlyStats.taxasDiagnostico}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor total:</span>
                  <span className="font-medium">R$ {(monthlyStats.taxasDiagnostico * 60).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">% do faturamento:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {(((monthlyStats.taxasDiagnostico * 60) / monthlyStats.faturamentoTotal) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Financeiro</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Faturamento:</span>
                  <span className="font-medium">R$ {monthlyStats.faturamentoTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ticket médio:</span>
                  <span className="font-medium">R$ {monthlyStats.ticketMedio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Crescimento:</span>
                  <Badge className="bg-green-100 text-green-800">+12.5%</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outros Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relatório de Clientes</CardTitle>
            <CardDescription>Análise do comportamento dos clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Clientes ativos:</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Novos clientes:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Clientes recorrentes:</span>
                <span className="font-medium">34</span>
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relatório de Estoque</CardTitle>
            <CardDescription>Movimentação de produtos e peças</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Itens em estoque:</span>
                <span className="font-medium">234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Itens utilizados:</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Estoque baixo:</span>
                <span className="font-medium text-red-600">8</span>
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <Package className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relatório de Performance</CardTitle>
            <CardDescription>Métricas de eficiência operacional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Tempo médio de reparo:</span>
                <span className="font-medium">3.2 dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Satisfação do cliente:</span>
                <span className="font-medium">4.7/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Retrabalho:</span>
                <span className="font-medium">2.1%</span>
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exportação */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
          <CardDescription>Baixe relatórios em diferentes formatos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowExportModal(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard Executivo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Excel export modal */}
      <ExcelExportModal open={showExportModal} onOpenChange={setShowExportModal} />
    </div>
  )
}

export { ReportsModule }
export default ReportsModule
