
import { createClient } from '@supabase/supabase-js'
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "N40#0u7r0C4m1n0J35u5Cr1570"

// Supabase Client para operações de autenticação
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// ============================================================================
// TIPOS DE DADOS
// ============================================================================

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  company: {
    id: string
    name: string
    status: string
    plan: string
  }
  lastLogin?: Date
}

export interface TokenPayload {
  userId: string
  companyId: string
  role: string
  email: string
}

// ============================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================================================

export function generateToken(user: AuthUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    companyId: user.company.id,
    role: user.role,
    email: user.email
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error('Token inválido:', error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  // 1. Autenticar no Supabase
  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password
  })

  // ✅ MELHORADO: Lança erro específico para credenciais inválidas
  if (authError || !authData.user) {
    // Log do erro original para depuração
    console.error('Supabase auth error:', authError?.message);
    // Lança um erro amigável para a API capturar
    throw new Error("E-mail ou senha incorretos.");
  }

  // 2. Buscar dados completos no Profile
  const profile = await prisma.profile.findUnique({
    where: { id: authData.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLogin: true,
      company: {
        select: {
          id: true,
          name: true,
          status: true,
          plan: true
        }
      }
    }
  })

  // ✅ MELHORADO: Lança erros específicos para outras falhas de login
  if (!profile) {
    throw new Error("Usuário não encontrado em nosso sistema.");
  }
  if (!profile.isActive) {
    throw new Error("Este usuário está desativado. Contate o suporte.");
  }
  if (profile.company.status !== 'ACTIVE') {
    throw new Error("A empresa associada a este usuário não está ativa.");
  }

  // 3. Atualizar último login (operação "fire-and-forget")
  prisma.profile.update({
    where: { id: profile.id },
    data: { lastLogin: new Date() }
  }).catch(err => console.error("Falha ao atualizar último login:", err));

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    isActive: profile.isActive,
    company: profile.company,
    lastLogin: new Date()
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) return null

    const token = authHeader.replace("Bearer ", "")
    if (!token) return null

    const decoded = verifyToken(token)
    if (!decoded) return null

    const profile = await prisma.profile.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        company: {
          select: {
            id: true,
            name: true,
            status: true,
            plan: true
          }
        }
      }
    })

    if (!profile || !profile.isActive || profile.company.status !== 'ACTIVE') {
      return null
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      isActive: profile.isActive,
      company: profile.company,
      lastLogin: profile.lastLogin || undefined
    }

  } catch (error) {
    console.error('Erro ao obter usuário autenticado:', error)
    return null
  }
}

// O resto do arquivo permanece como antes...
