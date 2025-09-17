
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma' // Use o singleton oficial do Prisma

// Tipagem para o cache global do Supabase
interface GlobalCache {
  supabaseClient?: any
}

// Inicializa o cache global
const globalCache: GlobalCache = {}

// Singleton para o Supabase Client
function getSupabaseClient() {
  if (!globalCache.supabaseClient) {
    globalCache.supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return globalCache.supabaseClient
}

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin?: Date
  company: any | null
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  const supabaseClient = getSupabaseClient()
  const normalizedEmail = email.toLowerCase().trim()

  console.log(`[AuthLogic] Tentando autenticar o usuário: ${email}`);

  const { data: authResponse, error: authError } = await supabaseClient.auth.signInWithPassword({ 
    email: normalizedEmail, 
    password 
  })
  
  if (authError || !authResponse.user) {
    console.error('[AuthLogic] Erro de autenticação do Supabase:', authError?.message);
    throw new Error("E-mail ou senha incorretos.")
  }

  console.log(`[AuthLogic] Supabase OK. Usuário ID: ${authResponse.user.id}. Buscando perfil no Prisma...`);

  try {
    // Agora usando a instância importada do prisma
    const profile = await prisma.profile.findUnique({
      where: { id: authResponse.user.id },
      include: { company: true },
    })

    if (!profile) {
      console.error(`[AuthLogic] Perfil não encontrado no Prisma para o ID: ${authResponse.user.id}`);
      throw new Error("Configuração de usuário inválida. Contate o suporte.")
    }

    console.log(`[AuthLogic] Perfil do Prisma encontrado.`);

    if (!profile.isActive) {
      console.warn(`[AuthLogic] Tentativa de login por usuário inativo: ${email} (ID: ${profile.id})`);
      throw new Error("Esta conta de usuário está desativada.")
    }
    
    if (profile.company && profile.company.status !== 'ACTIVE') {
      console.warn(`[AuthLogic] Tentativa de login com empresa inativa: ${profile.company.name} (Usuário: ${email})`);
      throw new Error("A empresa associada a esta conta está inativa.")
    }

    console.log(`[AuthLogic] Autenticação bem-sucedida para: ${email}`);

    const companyData = profile.company
      ? {
          ...profile.company,
          maxStorage: profile.company.maxStorage ? Number(profile.company.maxStorage) : null,
          maxUsers: profile.company.maxUsers ? Number(profile.company.maxUsers) : null,
        }
      : null;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      isActive: profile.isActive,
      lastLogin: profile.lastLogin || undefined,
      company: companyData,
    }
  } catch (error) {
    console.error('[AuthLogic] Erro durante a busca ou verificação do perfil no Prisma:', error);
    if (error instanceof Error && ["Configuração de usuário inválida. Contate o suporte.", "Esta conta de usuário está desativada.", "A empresa associada a esta conta está inativa."].includes(error.message)) {
      throw error;
    }
    throw new Error("Ocorreu um erro no servidor ao verificar o perfil de usuário.");
  }
}
