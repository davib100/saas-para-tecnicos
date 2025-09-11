# Sistema de Ordem de Serviço

Sistema completo para gerenciamento de ordens de serviço, clientes e produtos com interface moderna e responsiva.

## 🚀 Funcionalidades

- **Dashboard Interativo**: Visão geral com estatísticas em tempo real
- **Gerenciamento de Clientes**: CRUD completo com histórico
- **Controle de Produtos**: Estoque, preços e categorias
- **Ordens de Serviço**: Fluxo completo desde entrada até conclusão
- **Sistema Financeiro**: Controle de receitas, despesas e fluxo de caixa
- **Relatórios**: Exportação em Excel e PDF
- **Autenticação**: Sistema seguro com JWT
- **Multi-tenant**: Suporte a múltiplas empresas
- **Backup Automático**: Sistema de backup e restauração
- **Modo Escuro**: Interface adaptável

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT, bcryptjs
- **Validação**: Zod
- **Gráficos**: Recharts
- **Notificações**: Sonner

## 📦 Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <repository-url>
cd service-order-system
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
# ou
pnpm install
# ou
yarn install
\`\`\`

3. **Configure as variáveis de ambiente**
\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo `.env` com suas configurações:
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/service_orders_db"
JWT_SECRET="your-super-secret-jwt-key"
\`\`\`

4. **Configure o banco de dados**
\`\`\`bash
# Gerar o Prisma Client
npm run db:generate

# Executar migrações
npm run db:migrate

# Ou fazer push do schema (desenvolvimento)
npm run db:push
\`\`\`

5. **Inicie o servidor de desenvolvimento**
\`\`\`bash
npm run dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL com Prisma ORM. O schema inclui:

- **Companies**: Empresas (multi-tenant)
- **Users**: Usuários do sistema
- **Clients**: Clientes das empresas
- **Products**: Produtos/equipamentos
- **ServiceOrders**: Ordens de serviço
- **OrderItems**: Itens das ordens
- **Activities**: Histórico de atividades
- **Invoices**: Faturas
- **Backups**: Sistema de backup
- **CompanySettings**: Configurações por empresa

## 🔧 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start

# Linting
npm run lint

# Banco de dados
npm run db:generate    # Gerar Prisma Client
npm run db:push       # Push schema para DB
npm run db:migrate    # Executar migrações
npm run db:studio     # Abrir Prisma Studio
\`\`\`

## 🏗️ Estrutura do Projeto

\`\`\`
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx          # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Shadcn/ui)
│   └── ...               # Componentes específicos
├── lib/                  # Utilitários e configurações
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Autenticação
│   ├── validations.ts    # Schemas Zod
│   └── ...
├── prisma/               # Schema e migrações
│   └── schema.prisma     # Schema do banco
├── hooks/                # Custom hooks
├── middleware.ts         # Middleware Next.js
└── ...
\`\`\`

## 🔐 Autenticação

O sistema utiliza JWT para autenticação com:
- Hash de senhas com bcryptjs
- Middleware para proteção de rotas
- Suporte a múltiplas empresas (multi-tenant)
- Controle de acesso baseado em roles

## 📊 Sistema de Relatórios

- **Exportação Excel**: Dados completos em planilhas
- **Relatórios PDF**: Documentos formatados
- **Filtros Avançados**: Por período, status, cliente
- **Gráficos Interativos**: Visualização de dados
- **Dashboard em Tempo Real**: Métricas atualizadas

## 🔄 Sistema de Backup

- **Backup Automático**: Agendamento configurável
- **Backup Manual**: Sob demanda
- **Exportação Completa**: Todos os dados
- **Retenção**: Configurável por empresa
- **Restauração**: Interface simples

## 🎨 Interface

- **Design Responsivo**: Mobile-first
- **Modo Escuro**: Suporte completo
- **Acessibilidade**: WCAG 2.1 AA
- **Performance**: Otimizada para velocidade
- **PWA Ready**: Instalável como app

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker

\`\`\`bash
# Build da imagem
docker build -t service-order-system .

# Executar container
docker run -p 3000:3000 service-order-system
\`\`\`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

Desenvolvido com ❤️ usando Next.js e TypeScript
