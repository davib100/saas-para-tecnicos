
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; 
import { createClient } from '@supabase/supabase-js';

// Cliente PÚBLICO: Usado para operações do lado do cliente, como login.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente ADMIN: Usado para operações privilegiadas, como verificar a existência de um usuário.
// IMPORTANTE: Este cliente NUNCA deve ser exposto ao lado do cliente.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);


const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: '/login', 
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Por favor, informe seu e-mail e senha.");
        }
        
        const email = credentials.email.toLowerCase().trim();
        const { password } = credentials;

        // Etapa 1: Verificar se o usuário existe usando o cliente Admin.
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email: email });

        if (listError) {
            console.error("Erro ao listar usuários:", listError.message);
            throw new Error("Ocorreu um erro no servidor. Tente novamente.");
        }

        // ✅ LÓGICA MELHORADA: Se nenhum usuário for encontrado, o email não está cadastrado.
        if (!users || users.length === 0) {
            console.log(`Tentativa de login falhou: usuário ${email} não encontrado.`);
            throw new Error("Usuário não cadastrado.");
        }

        // Etapa 2: Usuário existe, agora tentar o login para verificar a senha.
        const { data: authResponse, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        // ✅ LÓGICA MELHORADA: Se o login falhar agora, a senha está incorreta.
        if (authError || !authResponse.user) {
          console.log(`Tentativa de login falhou para ${email}: senha incorreta.`);
          throw new Error("E-mail ou senha incorretos.");
        }

        // Etapa 3: Autenticação bem-sucedida, buscar perfil local e verificar status.
        try {
          const profile = await prisma.profile.findUnique({
            where: { id: authResponse.user.id },
            include: { company: true }
          });

          if (!profile) {
            console.error("Profile not found for user ID:", authResponse.user.id);
            throw new Error("Configuração de usuário inválida. Contate o suporte.");
          }
          if (!profile.isActive) {
            throw new Error("Esta conta de usuário está desativada.");
          }
          if (profile.company.status !== 'ACTIVE') {
            throw new Error("A empresa associada a esta conta está inativa.");
          }

          // Etapa 4: Retornar dados para a sessão do NextAuth.
          return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            companyId: profile.companyId,
            companyName: profile.company.name,
          };

        } catch (dbError) {
          if (dbError instanceof Error) {
            console.error("Authorization error:", dbError.message);
            throw dbError; // Re-lança o erro para o NextAuth lidar
          }
          console.error("Unknown database error:", dbError);
          throw new Error("Ocorreu um erro no servidor. Tente novamente mais tarde.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
        token.companyName = (user as any).companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
        (session.user as any).companyName = token.companyName;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
