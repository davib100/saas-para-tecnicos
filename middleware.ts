export { default } from "next-auth/middleware"

// A configuração abaixo protege todas as rotas da aplicação.
// O middleware do NextAuth redirecionará automaticamente os usuários não autenticados
// para a página de login definida no arquivo `lib/authOptions.ts`.
// O `matcher` garante que o middleware NÃO seja executado nas rotas públicas
// necessárias para o processo de autenticação (como a própria página de login),
// evitando um loop de redirecionamento infinito.
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto para aqueles que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (ícone de favicon)
     * - login (a página de login)
     * - register (a página de registro)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)', 
  ],
}
