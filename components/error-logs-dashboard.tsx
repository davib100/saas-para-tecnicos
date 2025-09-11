"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertTriangle,
  Bug,
  CheckCircle,
  ChevronDown,
  Copy,
  Download,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react"
import { useErrorLogger, type ErrorLog, type ErrorStats } from "@/lib/error-logger"
import { toast } from "sonner"

export function ErrorLogsDashboard() {
  const { getErrors, getStats, resolveError, clearErrors } = useErrorLogger()
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState<ErrorStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [filterScript, setFilterScript] = useState<string>("all")
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = () => {
    setErrors(getErrors())
    setStats(getStats())
  }

  const filteredErrors = errors.filter((error) => {
    const matchesSearch =
      error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.component?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.script?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = filterLevel === "all" || error.level === filterLevel
    const matchesScript = filterScript === "all" || error.script === filterScript

    return matchesSearch && matchesLevel && matchesScript
  })

  const handleResolveError = (errorId: string) => {
    resolveError(errorId)
    refreshData()
    toast.success("Erro marcado como resolvido")
  }

  const handleClearAllErrors = () => {
    clearErrors()
    refreshData()
    toast.success("Todos os logs foram limpos")
  }

  const handleExportErrors = () => {
    const dataStr = JSON.stringify(errors, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Logs exportados com sucesso")
  }

  const handleCopyError = (error: ErrorLog) => {
    const errorDetails = {
      id: error.id,
      timestamp: error.timestamp,
      level: error.level,
      message: error.message,
      component: error.component,
      script: error.script,
      stack: error.stack,
      metadata: error.metadata,
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
    toast.success("Detalhes do erro copiados")
  }

  const toggleErrorExpansion = (errorId: string) => {
    const newExpanded = new Set(expandedErrors)
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId)
    } else {
      newExpanded.add(errorId)
    }
    setExpandedErrors(newExpanded)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Bug className="w-4 h-4 text-gray-500" />
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Logs de Erros</h2>
          <p className="text-muted-foreground">Monitore e gerencie erros do sistema em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExportErrors}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="destructive" onClick={handleClearAllErrors}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="errors">Lista de Erros</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalErrors}</div>
                  <p className="text-xs text-muted-foreground">Desde o início da sessão</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Erros Críticos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.errorsByLevel.error || 0}</div>
                  <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scripts Afetados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(stats.errorsByScript).length}</div>
                  <p className="text-xs text-muted-foreground">Diferentes arquivos com erros</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Erros Recentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentErrors.length}</div>
                  <p className="text-xs text-muted-foreground">Últimos 20 erros registrados</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Erros Recentes</CardTitle>
              <CardDescription>Os erros mais recentes registrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentErrors.slice(0, 5).map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getLevelIcon(error.level)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{error.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {error.component} • {error.script} • {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getLevelBadgeVariant(error.level)}>{error.level}</Badge>
                  </div>
                ))}
                {!stats?.recentErrors.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>Nenhum erro registrado! Sistema funcionando perfeitamente.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por mensagem, componente ou script..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">Todos os níveis</option>
                  <option value="error">Erros</option>
                  <option value="warning">Avisos</option>
                  <option value="info">Informações</option>
                </select>
                <select
                  value={filterScript}
                  onChange={(e) => setFilterScript(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">Todos os scripts</option>
                  {stats &&
                    Object.keys(stats.errorsByScript).map((script) => (
                      <option key={script} value={script}>
                        {script} ({stats.errorsByScript[script]})
                      </option>
                    ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Error List */}
          <div className="space-y-4">
            {filteredErrors.map((error) => (
              <Card key={error.id} className={error.resolved ? "opacity-60" : ""}>
                <Collapsible open={expandedErrors.has(error.id)} onOpenChange={() => toggleErrorExpansion(error.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getLevelIcon(error.level)}
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base truncate">{error.message}</CardTitle>
                            <CardDescription>
                              {error.component} • {error.script} • {new Date(error.timestamp).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getLevelBadgeVariant(error.level)}>{error.level}</Badge>
                          {error.resolved && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Resolvido
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {error.stack && (
                          <div>
                            <h4 className="font-medium mb-2">Stack Trace:</h4>
                            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-40">
                              {error.stack}
                            </pre>
                          </div>
                        )}

                        {error.metadata && (
                          <div>
                            <h4 className="font-medium mb-2">Metadados:</h4>
                            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                              {JSON.stringify(error.metadata, null, 2)}
                            </pre>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleCopyError(error)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                          {!error.resolved && (
                            <Button variant="outline" size="sm" onClick={() => handleResolveError(error.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como Resolvido
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}

            {filteredErrors.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-muted-foreground">
                    {searchTerm || filterLevel !== "all" || filterScript !== "all"
                      ? "Nenhum erro encontrado com os filtros aplicados."
                      : "Nenhum erro registrado! Sistema funcionando perfeitamente."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {stats && (
            <>
              {/* Errors by Script */}
              <Card>
                <CardHeader>
                  <CardTitle>Erros por Script</CardTitle>
                  <CardDescription>Distribuição de erros pelos diferentes arquivos do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.errorsByScript)
                      .sort(([, a], [, b]) => b - a)
                      .map(([script, count]) => (
                        <div key={script} className="flex items-center justify-between">
                          <span className="font-mono text-sm">{script}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...Object.values(stats.errorsByScript))) * 100}%`,
                                }}
                              />
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Errors */}
              <Card>
                <CardHeader>
                  <CardTitle>Erros Mais Frequentes</CardTitle>
                  <CardDescription>Os erros que ocorrem com mais frequência no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topErrors.map((error, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{error.message}</p>
                          <p className="text-sm text-muted-foreground">
                            Última ocorrência: {new Date(error.lastOccurred).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="destructive">{error.count}x</Badge>
                      </div>
                    ))}
                    {stats.topErrors.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>Nenhum erro frequente detectado!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
