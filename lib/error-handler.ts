import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"
import { logApiError } from "./error-logger"

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleApiError(error: unknown, endpoint?: string): NextResponse {
  console.error("[v0] API Error:", error)

  if (endpoint) {
    logApiError(endpoint, error, {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  }

  // Validation errors (Zod)
  if (error instanceof ZodError) {
    const errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }))

    return NextResponse.json(
      {
        error: "Dados inválidos",
        details: errors,
        type: "validation_error",
        errorId: endpoint ? logApiError(endpoint, error) : undefined,
      },
      { status: 400 },
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let errorMessage = "Erro no banco de dados"
    let statusCode = 500

    switch (error.code) {
      case "P2002":
        errorMessage = "Já existe um registro com estes dados únicos"
        statusCode = 409
        break
      case "P2025":
        errorMessage = "Registro não encontrado"
        statusCode = 404
        break
      case "P2003":
        errorMessage = "Violação de chave estrangeira"
        statusCode = 400
        break
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.meta?.target,
        type: `prisma_${error.code}`,
        errorId: endpoint ? logApiError(endpoint, error) : undefined,
      },
      { status: statusCode },
    )
  }

  // Custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        type: "app_error",
        errorId: endpoint ? logApiError(endpoint, error) : undefined,
      },
      { status: error.statusCode },
    )
  }

  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return NextResponse.json(
      {
        error: "Erro de conexão com serviços externos",
        type: "network_error",
        errorId: endpoint ? logApiError(endpoint, error) : undefined,
      },
      { status: 503 },
    )
  }

  // Generic errors
  return NextResponse.json(
    {
      error:
        process.env.NODE_ENV === "production"
          ? "Erro interno do servidor"
          : error instanceof Error
            ? error.message
            : "Erro desconhecido",
      type: "internal_error",
      errorId: endpoint ? logApiError(endpoint, error) : undefined,
    },
    { status: 500 },
  )
}

export function createApiHandler<T>(handler: (request: Request, context?: any) => Promise<T>, endpoint?: string) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, endpoint || request.url)
    }
  }
}

export function handleClientError(error: unknown, component?: string): string {
  console.error("[v0] Client Error:", error)

  // Log the error for tracking
  if (component) {
    logApiError(component, error, {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    })
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch") || error.message.includes("NetworkError")) {
      return "Erro de conexão. Verifique sua internet e tente novamente."
    }

    // Timeout errors
    if (error.message.includes("timeout")) {
      return "A operação demorou muito para responder. Tente novamente."
    }

    return error.message
  }

  // API response errors
  if (typeof error === "object" && error !== null && "error" in error) {
    return (error as any).error || "Erro desconhecido"
  }

  return "Ocorreu um erro inesperado. Tente novamente."
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("fetch") ||
      message.includes("connection")
    )
  }

  if (typeof error === "object" && error !== null && "type" in error) {
    const errorType = (error as any).type
    return errorType === "network_error" || errorType === "timeout_error"
  }

  return false
}
