let PrismaClient: any

try {
  // Tentativa de importação normal
  const prismaModule = require("@prisma/client")
  PrismaClient = prismaModule.PrismaClient
} catch (error) {
  console.error("Erro ao importar @prisma/client:", error)
  // Fallback: tentar importação dinâmica
  try {
    const prismaModule = eval("require")("@prisma/client")
    PrismaClient = prismaModule.PrismaClient
  } catch (fallbackError) {
    console.error("Erro no fallback de importação:", fallbackError)
    throw new Error("Não foi possível importar @prisma/client. Execute: npm run db:generate")
  }
}

declare global {
  var __prisma: any | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = prisma
}

export { prisma }
export default prisma
