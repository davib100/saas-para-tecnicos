import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import prisma from "@/lib/prisma";
import { z } from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const generateSlug = (name: string, companyId: string): string => 
  `${name.toLowerCase().replace(/[^\w]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'company'}-${companyId.slice(-6)}`;

const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().toLowerCase().trim(),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(128, "Senha deve ter no máximo 128 caracteres")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Senha deve conter pelo menos uma letra, um número e um caractere especial (@$!%*?&)"),
  companyId: z.string().min(1),
  role: z.enum(["ADMIN", "MANAGER", "TECHNICIAN", "USER", "VIEWER"]).default("USER"),
  phone: z.string().optional().nullable()
});

export async function POST(request: Request) {
  let authUserId: string | null = null;
  
  try {
    const body = await request.json();
    const { name, email, password, companyId, role, phone } = registerSchema.parse(body);

    const existingProfile = await prisma.profile.findUnique({ 
      where: { email }, 
      select: { id: true } 
    });

    if (existingProfile) {
      return NextResponse.json({
        success: false,
        error: "Este email já está em uso"
      }, { status: 409 });
    }

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
        if (companyError.code === 'P2002' && companyError.meta?.target?.includes('email')) {
          return NextResponse.json({
            success: false,
            error: "Este email já está sendo usado por outra empresa"
          }, { status: 409 });
        }
        throw companyError;
      }
    }

    if (company._count.users >= company.maxUsers) {
      return NextResponse.json({
        success: false,
        error: "Limite de usuários excedido"
      }, { status: 403 });
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, companyId, role, phone }
    });

    if (authError || !authUser?.user?.id) {
      return NextResponse.json({
        success: false,
        error: authError?.message || "Falha ao criar usuário"
      }, { status: 400 });
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
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        company: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Usuário cadastrado com sucesso",
      data: { user: profile, company: profile.company }
    }, { status: 201 });

  } catch (error: any) {
    if (authUserId) {
      supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Dados inválidos",
        details: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      }, { status: 400 });
    }

    const errorCodes: Record<string, { message: string; status: number }> = {
      'P2002': { message: "Este email já está em uso", status: 409 },
      'P2003': { message: "Empresa não encontrada", status: 404 }
    };

    const knownError = errorCodes[error.code];
    if (knownError) {
      return NextResponse.json({ success: false, error: knownError.message }, { status: knownError.status });
    }

    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });

  } finally {
    prisma.$disconnect();
  }
}