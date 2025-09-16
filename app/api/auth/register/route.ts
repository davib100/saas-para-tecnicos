import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";
import { createApiHandler, AppError } from "@/lib/error-handler";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const generateSlug = (name: string, companyId: string): string =>
  `${name.toLowerCase().replace(/[^\w]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'company'}-${companyId.slice(-6)}`;

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(255),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(128, "Senha deve ter no máximo 128 caracteres")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Senha deve conter letra, número e caractere especial (@$!%*?&)"),
  companyId: z.string().min(1, "ID da empresa é obrigatório"),
  role: z.enum(["ADMIN", "MANAGER", "TECHNICIAN", "USER", "VIEWER"]).default("USER"),
  phone: z.string().optional().nullable()
});

export const POST = createApiHandler(async (request: Request) => {
  let authUserId: string | null = null;

  try {
    const body = await request.json();
    const { name, email, password, companyId, role, phone } = registerSchema.parse(body);

    let company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, maxUsers: true, _count: { select: { users: true } } }
    });

    if (!company) {
       try {
        company = await prisma.company.create({
          data: {
            id: companyId,
            name: `${name}'s Company`,
            slug: generateSlug(name, companyId),
            email: email,
            status: 'ACTIVE',
            maxUsers: 10
          },
          select: { id: true, maxUsers: true, _count: { select: { users: true } } }
        });
      } catch (companyError: any) {
        // P2002 specifically for company email conflict
        if (companyError.code === 'P2002' && companyError.meta?.target?.includes('email')) {
            throw new AppError("Este email já está sendo usado por outra empresa", 409);
        }
        throw companyError; // Re-throw other company creation errors
      }
    }

    if (company._count.users >= company.maxUsers) {
      throw new AppError("Limite de usuários da empresa excedido", 403);
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirma o email
      user_metadata: { name, companyId, role, phone }
    });

    if (authError || !authUser?.user?.id) {
      console.error("Supabase createUser error:", authError);
      throw new AppError("Falha ao criar usuário. O e-mail pode já estar em uso.", 400);
    }

    authUserId = authUser.user.id;

    const profile = await prisma.profile.create({
      data: {
        id: authUserId,
        name,
        email,
        role,
        phone: phone || null,
        companyId,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Usuário cadastrado com sucesso",
      data: { 
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          createdAt: profile.createdAt
        },
        company 
      }
    }, { status: 201 });

  } catch (error) {
    // Bloco CATCH para Rollback Crítico
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(rollbackError => {
        console.error("CRITICAL: Falha ao reverter a criação do usuário no Supabase!", {
          failedAuthUserId: authUserId,
          originalError: error,
          rollbackError: rollbackError
        });
      });
    }
    // Relança o erro original para o handler global cuidar da resposta
    throw error;
  }
}, 'auth/register');
