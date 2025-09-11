import { execSync } from "child_process"

console.log("🔄 Gerando Prisma Client...")

try {
  // Gerar o Prisma Client
  execSync("npx prisma generate", { stdio: "inherit" })
  console.log("✅ Prisma Client gerado com sucesso!")

  // Verificar se o cliente foi gerado corretamente
  try {
    const { PrismaClient } = require("@prisma/client")
    const prisma = new PrismaClient()
    console.log("✅ PrismaClient importado com sucesso!")
    await prisma.$disconnect()
  } catch (error) {
    console.error("❌ Erro ao importar PrismaClient:", error)
  }
} catch (error) {
  console.error("❌ Erro ao gerar Prisma Client:", error)
  process.exit(1)
}
