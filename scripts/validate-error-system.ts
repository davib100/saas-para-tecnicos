// Script para validação automatizada do sistema de erros
import { errorLogger, logComponentError, logScriptError, logApiError } from "../lib/error-logger"

interface ValidationResult {
  test: string
  passed: boolean
  message: string
  details?: any
}

class ErrorSystemValidator {
  private results: ValidationResult[] = []

  async runValidation(): Promise<ValidationResult[]> {
    console.log("🧪 Iniciando validação do sistema de erros...")

    this.results = []

    // Test 1: Verificar se o logger está inicializado
    await this.testLoggerInitialization()

    // Test 2: Testar logging de componente
    await this.testComponentLogging()

    // Test 3: Testar logging de script
    await this.testScriptLogging()

    // Test 4: Testar logging de API
    await this.testApiLogging()

    // Test 5: Testar persistência
    await this.testPersistence()

    // Test 6: Testar estatísticas
    await this.testStatistics()

    // Test 7: Testar limpeza
    await this.testCleanup()

    this.printResults()
    return this.results
  }

  private async testLoggerInitialization() {
    try {
      const stats = errorLogger.getErrorStats()
      this.addResult("Logger Initialization", true, "Logger inicializado com sucesso", stats)
    } catch (error) {
      this.addResult("Logger Initialization", false, `Falha na inicialização: ${error}`)
    }
  }

  private async testComponentLogging() {
    try {
      const errorId = logComponentError("TestComponent", new Error("Test component error"), {
        testRun: true,
        timestamp: new Date().toISOString(),
      })

      const errors = errorLogger.getErrors()
      const testError = errors.find((e) => e.id === errorId)

      if (testError && testError.component === "TestComponent") {
        this.addResult("Component Logging", true, `Erro de componente registrado: ${errorId}`)
      } else {
        this.addResult("Component Logging", false, "Erro de componente não foi registrado corretamente")
      }
    } catch (error) {
      this.addResult("Component Logging", false, `Falha no logging de componente: ${error}`)
    }
  }

  private async testScriptLogging() {
    try {
      const errorId = logScriptError("validate-error-system.ts", new Error("Test script error"), {
        testRun: true,
        lineNumber: 42,
      })

      const errors = errorLogger.getErrors()
      const testError = errors.find((e) => e.id === errorId)

      if (testError && testError.script === "validate-error-system.ts") {
        this.addResult("Script Logging", true, `Erro de script registrado: ${errorId}`)
      } else {
        this.addResult("Script Logging", false, "Erro de script não foi registrado corretamente")
      }
    } catch (error) {
      this.addResult("Script Logging", false, `Falha no logging de script: ${error}`)
    }
  }

  private async testApiLogging() {
    try {
      const errorId = logApiError("/api/test", new Error("Test API error"), {
        testRun: true,
        method: "POST",
        statusCode: 500,
      })

      const errors = errorLogger.getErrors()
      const testError = errors.find((e) => e.id === errorId)

      if (testError && testError.script === "/api/test") {
        this.addResult("API Logging", true, `Erro de API registrado: ${errorId}`)
      } else {
        this.addResult("API Logging", false, "Erro de API não foi registrado corretamente")
      }
    } catch (error) {
      this.addResult("API Logging", false, `Falha no logging de API: ${error}`)
    }
  }

  private async testPersistence() {
    try {
      // Simular persistência verificando se há dados no "localStorage" simulado
      const errors = errorLogger.getErrors()

      if (errors.length > 0) {
        this.addResult("Persistence", true, `${errors.length} erros persistidos na memória`)
      } else {
        this.addResult("Persistence", false, "Nenhum erro encontrado na persistência")
      }
    } catch (error) {
      this.addResult("Persistence", false, `Falha na verificação de persistência: ${error}`)
    }
  }

  private async testStatistics() {
    try {
      const stats = errorLogger.getErrorStats()

      const hasStats =
        stats.totalErrors > 0 &&
        Object.keys(stats.errorsByScript).length > 0 &&
        Object.keys(stats.errorsByComponent).length > 0

      if (hasStats) {
        this.addResult(
          "Statistics",
          true,
          `Estatísticas geradas: ${stats.totalErrors} erros, ${Object.keys(stats.errorsByScript).length} scripts`,
          stats,
        )
      } else {
        this.addResult("Statistics", false, "Estatísticas não estão sendo geradas corretamente")
      }
    } catch (error) {
      this.addResult("Statistics", false, `Falha na geração de estatísticas: ${error}`)
    }
  }

  private async testCleanup() {
    try {
      const errorsBefore = errorLogger.getErrors().length
      errorLogger.clearErrors()
      const errorsAfter = errorLogger.getErrors().length

      if (errorsAfter === 0) {
        this.addResult("Cleanup", true, `${errorsBefore} erros limpos com sucesso`)
      } else {
        this.addResult("Cleanup", false, `Limpeza falhou: ${errorsAfter} erros restantes`)
      }
    } catch (error) {
      this.addResult("Cleanup", false, `Falha na limpeza: ${error}`)
    }
  }

  private addResult(test: string, passed: boolean, message: string, details?: any) {
    this.results.push({ test, passed, message, details })
  }

  private printResults() {
    console.log("\n📊 Resultados da Validação:")
    console.log("=".repeat(50))

    let passed = 0
    let failed = 0

    this.results.forEach((result) => {
      const status = result.passed ? "✅ PASSOU" : "❌ FALHOU"
      console.log(`${status} | ${result.test}`)
      console.log(`   ${result.message}`)

      if (result.details) {
        console.log(`   Detalhes:`, result.details)
      }

      console.log("")

      if (result.passed) passed++
      else failed++
    })

    console.log("=".repeat(50))
    console.log(`📈 Resumo: ${passed} passou, ${failed} falhou de ${this.results.length} testes`)

    if (failed === 0) {
      console.log("🎉 Todos os testes passaram! Sistema de erros está funcionando corretamente.")
    } else {
      console.log("⚠️  Alguns testes falharam. Verifique os detalhes acima.")
    }
  }
}

// Executar validação se o script for chamado diretamente
if (typeof window === "undefined") {
  const validator = new ErrorSystemValidator()
  validator
    .runValidation()
    .then((results) => {
      const failedTests = results.filter((r) => !r.passed)
      process.exit(failedTests.length > 0 ? 1 : 0)
    })
    .catch((error) => {
      console.error("❌ Erro durante validação:", error)
      process.exit(1)
    })
}

export { ErrorSystemValidator }
