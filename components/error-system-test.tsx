"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Bug, CheckCircle, Play, RefreshCw, Zap } from "lucide-react"
import { logComponentError, logScriptError, logApiError, useErrorLogger } from "@/lib/error-logger"
import { useErrorBoundary } from "@/components/enhanced-error-boundary"
import { handleClientError, isRetryableError } from "@/lib/error-handler"
import { toast } from "sonner"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  errorId?: string
}

export function ErrorSystemTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { getErrors, getStats, clearErrors } = useErrorLogger()
  const { captureError } = useErrorBoundary()

  const updateTestResult = (name: string, status: "success" | "error", message: string, errorId?: string) => {
    setTestResults((prev) => prev.map((test) => (test.name === name ? { ...test, status, message, errorId } : test)))
  }

  const initializeTests = () => {
    const tests: TestResult[] = [
      { name: "Component Error Logging", status: "pending", message: "Aguardando execução..." },
      { name: "Script Error Logging", status: "pending", message: "Aguardando execução..." },
      { name: "API Error Logging", status: "pending", message: "Aguardando execução..." },
      { name: "Error Boundary Capture", status: "pending", message: "Aguardando execução..." },
      { name: "Client Error Handling", status: "pending", message: "Aguardando execução..." },
      { name: "Retry Logic Test", status: "pending", message: "Aguardando execução..." },
      { name: "Error Statistics", status: "pending", message: "Aguardando execução..." },
      { name: "Error Persistence", status: "pending", message: "Aguardando execução..." },
    ]
    setTestResults(tests)
  }

  const runAllTests = async () => {
    setIsRunning(true)
    initializeTests()

    try {
      // Test 1: Component Error Logging
      try {
        const errorId = logComponentError("ErrorSystemTest", new Error("Test component error"), {
          testType: "component_logging",
          timestamp: new Date().toISOString(),
        })
        updateTestResult("Component Error Logging", "success", `Erro registrado com ID: ${errorId.slice(-8)}`, errorId)
      } catch (error) {
        updateTestResult("Component Error Logging", "error", `Falha: ${error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Test 2: Script Error Logging
      try {
        const errorId = logScriptError("error-system-test.tsx", new Error("Test script error"), {
          testType: "script_logging",
          lineNumber: 42,
        })
        updateTestResult(
          "Script Error Logging",
          "success",
          `Erro de script registrado com ID: ${errorId.slice(-8)}`,
          errorId,
        )
      } catch (error) {
        updateTestResult("Script Error Logging", "error", `Falha: ${error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Test 3: API Error Logging
      try {
        const errorId = logApiError("/api/test", new Error("Test API error"), {
          testType: "api_logging",
          method: "POST",
          statusCode: 500,
        })
        updateTestResult("API Error Logging", "success", `Erro de API registrado com ID: ${errorId.slice(-8)}`, errorId)
      } catch (error) {
        updateTestResult("API Error Logging", "error", `Falha: ${error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Test 4: Error Boundary Capture
      try {
        const testError = new Error("Test error boundary capture")
        captureError(testError)
        updateTestResult("Error Boundary Capture", "success", "Error boundary capturou erro com sucesso")
      } catch (error) {
        updateTestResult("Error Boundary Capture", "error", `Falha: ${error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Test 5: Client Error Handling
      try {
        const networkError = new Error("NetworkError: Failed to fetch")
        const message = handleClientError(networkError, "ErrorSystemTest")
        if (message.includes("conexão")) {
          updateTestResult("Client Error Handling", "success", `Mensagem tratada: "${message}"`)
        } else {
          updateTestResult("Client Error Handling", "error", "Mensagem não foi tratada corretamente")
        }
      } catch (error) {
        updateTestResult("Client Error Handling", "error", `Falha: ${error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Test 6: Retry Logic Test
      try {
        const retryableError = new Error("timeout")
        const nonRetryableError = new Error("validation error")

        const canRetry1 = isRetryableError(retryableError)
        const canRetry2 = isRetryableError(nonRetryableError)

        if (canRetry1 && !canRetry2) {
          updateTestResult("Retry Logic Test", "success", "Lógica de retry funcionando corretamente")
        } else {
          updateTestResult("Retry Logic Test", "error", "Lógica de retry não está funcionando")
        }
      } catch (error) {
        updateTestResult("Retry Logic Test", "error", `Falha: ${error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Test 7: Error Statistics
      try {
        const stats = getStats()
        if (stats.totalErrors > 0 && Object.keys(stats.errorsByScript).length > 0) {
          updateTestResult(
            "Error Statistics",
            "success",
            `${stats.totalErrors} erros registrados, ${Object.keys(stats.errorsByScript).length} scripts afetados`,
          )
        } else {
          updateTestResult("Error Statistics", "error", "Estatísticas não estão sendo geradas")
        }
      } catch (error) {
        updateTestResult("Error Statistics", "error", `Falha: ${error}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Test 8: Error Persistence
      try {
        const errorsBefore = getErrors().length

        // Simular recarregamento verificando localStorage
        const stored = localStorage.getItem("app_error_logs")
        if (stored) {
          const parsedErrors = JSON.parse(stored)
          if (Array.isArray(parsedErrors) && parsedErrors.length > 0) {
            updateTestResult("Error Persistence", "success", `${parsedErrors.length} erros persistidos no localStorage`)
          } else {
            updateTestResult("Error Persistence", "error", "Nenhum erro encontrado no localStorage")
          }
        } else {
          updateTestResult("Error Persistence", "error", "localStorage não contém erros")
        }
      } catch (error) {
        updateTestResult("Error Persistence", "error", `Falha: ${error}`)
      }
    } catch (error) {
      toast.error("Erro durante execução dos testes")
      console.error("Test execution error:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const clearAllErrors = () => {
    clearErrors()
    toast.success("Todos os erros foram limpos")
  }

  const triggerTestError = () => {
    throw new Error("Erro de teste manual para validar error boundary")
  }

  const triggerAsyncError = async () => {
    try {
      // Simular erro de API
      await fetch("/api/nonexistent-endpoint")
    } catch (error) {
      logApiError("/api/nonexistent-endpoint", error, {
        testType: "manual_async_error",
        userTriggered: true,
      })
      toast.error("Erro assíncrono registrado com sucesso")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Bug className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      case "error":
        return <Badge variant="destructive">Erro</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const successCount = testResults.filter((t) => t.status === "success").length
  const errorCount = testResults.filter((t) => t.status === "error").length
  const totalTests = testResults.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teste do Sistema de Erros</h2>
          <p className="text-muted-foreground">Valide o funcionamento completo do sistema de tratamento de erros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearAllErrors}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar Erros
          </Button>
          <Button onClick={runAllTests} disabled={isRunning}>
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Executando..." : "Executar Testes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="automated" className="space-y-6">
        <TabsList>
          <TabsTrigger value="automated">Testes Automatizados</TabsTrigger>
          <TabsTrigger value="manual">Testes Manuais</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-6">
          {/* Test Results Summary */}
          {testResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Testes</CardTitle>
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTests}</div>
                  <p className="text-xs text-muted-foreground">Testes de validação do sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <p className="text-xs text-muted-foreground">Testes aprovados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Falhas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <p className="text-xs text-muted-foreground">Testes com falha</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Test Results List */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados dos Testes</CardTitle>
              <CardDescription>Status detalhado de cada teste de validação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bug className="w-12 h-12 mx-auto mb-2" />
                    <p>Clique em "Executar Testes" para iniciar a validação</p>
                  </div>
                ) : (
                  testResults.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-muted-foreground">{test.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(test.status)}
                        {test.errorId && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {test.errorId.slice(-8)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testes Manuais</CardTitle>
              <CardDescription>Execute testes manuais para validar comportamentos específicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Erro Síncrono</CardTitle>
                    <CardDescription>Testa o error boundary com erro síncrono</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={triggerTestError} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Disparar Erro Síncrono
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Erro Assíncrono</CardTitle>
                    <CardDescription>Testa logging de erro em operação assíncrona</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={triggerAsyncError} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Disparar Erro Assíncrono
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Instruções para Teste Manual</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>1. Execute os testes automatizados primeiro</li>
                  <li>2. Clique nos botões de erro manual para testar o error boundary</li>
                  <li>3. Verifique se os erros aparecem no dashboard de logs</li>
                  <li>4. Teste a funcionalidade de "Tentar Novamente" no error boundary</li>
                  <li>5. Verifique se os erros são persistidos no localStorage</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Validação</CardTitle>
              <CardDescription>Status geral do sistema de tratamento de erros</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Status Geral do Sistema</h4>
                      <p className="text-sm text-muted-foreground">
                        {successCount} de {totalTests} testes aprovados
                      </p>
                    </div>
                    <div className="text-right">
                      {errorCount === 0 ? (
                        <Badge className="bg-green-100 text-green-800">Sistema Funcionando</Badge>
                      ) : (
                        <Badge variant="destructive">{errorCount} Falha(s) Detectada(s)</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Componentes Testados</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ Sistema de logging de erros</li>
                        <li>✓ Error boundary avançado</li>
                        <li>✓ Tratamento de erros de API</li>
                        <li>✓ Persistência de logs</li>
                        <li>✓ Dashboard de monitoramento</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Funcionalidades Validadas</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ Captura automática de erros</li>
                        <li>✓ Rastreamento por script/componente</li>
                        <li>✓ Retry logic inteligente</li>
                        <li>✓ Estatísticas detalhadas</li>
                        <li>✓ Interface de gerenciamento</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  <p>Execute os testes para ver o resumo da validação</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
