import type { AuthOptions } from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { authenticateUser } from "./auth-logic"

export const authOptions: AuthOptions = {
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
          throw new Error("Credenciais não fornecidas.")
        }
        
        try {
          const user = await authenticateUser(credentials.email, credentials.password)
          return user
        } catch (error) {
          throw new Error((error as Error).message)
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.company = user.company
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.email = token.email as string
      session.user.company = token.company
      
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}