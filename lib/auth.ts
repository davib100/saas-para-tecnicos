
import { getServerSession } from 'next-auth/next'
import { authOptions } from './authOptions'
import { prisma } from './prisma'
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin?: Date
  company: {
    id: string
    name: string
    status: string
    plan: string
  } | null
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
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
          plan: true,
        },
      },
    },
  })

  if (!profile || !profile.isActive) {
    return null
  }
  
  if (profile.company && profile.company.status !== 'ACTIVE') {
    return null
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

export function generateToken(user: AuthUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Chave secreta JWT não configurada.");
  }
  
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role, 
      companyId: user.company?.id 
    },
    secret,
    { expiresIn: '1d' }
  );
}
