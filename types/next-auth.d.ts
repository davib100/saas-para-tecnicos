import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      company: {
        id: string
        name: string
        status: string
        plan: string
      } | null
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    company: {
      id: string
      name: string
      status: string
      plan: string
    } | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    company: {
      id: string
      name: string
      status: string
      plan: string
    } | null
  }
}
