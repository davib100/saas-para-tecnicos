import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignorar todas as rotas da API NextAuth para evitar conflitos e loops
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 2. Definir as rotas de página que são publicamente acessíveis
  const publicPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicPage = publicPages.some(path => pathname.startsWith(path));

  // 3. Obter o token de sessão do usuário
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // 4. Se a rota é pública, permitir o acesso. 
  // O Next.js cuidará de redirecionar o usuário se ele já estiver logado e tentar acessar o login.
  if (isPublicPage) {
    return NextResponse.next();
  }
  
  // 5. Se a rota é protegida e não há token, redirecionar para o login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Se o token existe e a rota é protegida, permitir acesso e enriquecer headers
  const response = NextResponse.next();
  if (token.id) response.headers.set("x-user-id", token.id as string);
  if (token.companyId) response.headers.set("x-company-id", token.companyId as string);
  
  return response;
}

// O matcher agora é mais simples: ele executa o middleware em tudo, 
// exceto nos arquivos estáticos. A lógica de qual rota proteger fica toda dentro da função.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
