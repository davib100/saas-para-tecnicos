import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin?: Date
  company: any | null
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.toLowerCase().trim()

  const { data: authResponse, error: authError } = await supabaseClient.auth.signInWithPassword({ 
    email: normalizedEmail, 
    password 
  })
  
  if (authError || !authResponse.user) {
    throw new Error("E-mail ou senha incorretos.")
  }

  const profile = await prisma.profile.findUnique({
    where: { id: authResponse.user.id },
    include: { company: true },
  })

  if (!profile) {
    throw new Error("Configuração de usuário inválida. Contate o suporte.")
  }
  
  if (!profile.isActive) {
    throw new Error("Esta conta de usuário está desativada.")
  }
  
  if (profile.company && profile.company.status !== 'ACTIVE') {
    throw new Error("A empresa associada a esta conta está inativa.")
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    isActive: profile.isActive,
    lastLogin: profile.lastLogin || undefined,
    company: profile.company || null,
  }
}