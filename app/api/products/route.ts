import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createApiHandler, AppError } from "@/lib/error-handler";

// Esquema de validação para criação
const createProductSchema = z.object({
  tipo: z.enum(["estoque", "maquina"]),
  nome: z.string().min(1, "Nome é obrigatório"),
  sku: z.string().optional(),
  preco: z.coerce.number().optional(),
  quantidade: z.coerce.number().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  estadoEntrada: z.string().optional(),
  acessorios: z.string().optional(),
  senha: z.string().optional(),
  observacoes: z.string().optional(),
});

// POST: Criar um novo produto
export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser();
  if (!user || !user.company?.id) {
    throw new AppError("Não autorizado", 401);
  }

  const body = await request.json();
  const productData = createProductSchema.parse(body);

  const newProduct = await prisma.product.create({
    data: {
      ...productData,
      companyId: user.company.id,
    },
  });

  return NextResponse.json(newProduct, { status: 201 });
}, "products/create");

// GET: Listar produtos com paginação e busca
export const GET = createApiHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user || !user.company) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const searchTerm = searchParams.get("search") || "";

  const whereCondition = {
    companyId: user.company.id,
    ...(searchTerm && {
      OR: [
        { nome: { contains: searchTerm, mode: "insensitive" } },
        { sku: { contains: searchTerm, mode: "insensitive" } },
        { marca: { contains: searchTerm, mode: "insensitive" } },
        { modelo: { contains: searchTerm, mode: "insensitive" } },
      ],
    }),
  };

  const products = await prisma.product.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalProducts = await prisma.product.count({
    where: whereCondition,
  });

  return NextResponse.json({
    products,
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
  });
}, "products/list");
