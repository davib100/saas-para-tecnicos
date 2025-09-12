
import 'dotenv/config';

async function checkEnv() {
  console.log('--- Verificando Variáveis de Ambiente Essenciais ---');

  // Helper to check if a package is installed
  const isPackageInstalled = async (packageName) => {
    try {
      await import(packageName);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Check for dotenv
  const dotenvInstalled = await isPackageInstalled('dotenv');
  if (!dotenvInstalled) {
    console.error('❌ FATAL: O pacote `dotenv` não está instalado.');
    console.error('   -> Execute `npm install dotenv` e tente novamente.');
    return;
  }

  const checks = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      test: (val) => val && val.startsWith('https://') && val.endsWith('supabase.co'),
      message: "Deve ser uma URL válida do Supabase, começando com 'https://' e terminando com 'supabase.co'.",
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      test: (val) => val && val.length > 100, // JWTs are long
      message: 'Deve ser a chave pública (anon key) completa. Parece muito curta.',
    },
    {
      name: 'DATABASE_URL',
      test: (val) => val && val.startsWith('postgresql://'),
      message: "Deve ser uma URL de conexão do PostgreSQL, começando com 'postgresql://'. Verifique usuário, senha e host.",
    },
    {
      name: 'NEXTAUTH_SECRET',
      test: (val) => val && val.length >= 16 && val !== 'SUPER_SEGREDO_DEVE_SER_TROCAD0',
      message: 'Deve ser uma string secreta com pelo menos 16 caracteres e não pode ser o valor padrão.',
    }
  ];

  let allGood = true;

  for (const check of checks) {
    const value = process.env[check.name];
    if (check.test(value)) {
      console.log(`✅ ${check.name}: Carregada e formato parece correto.`);
    } else {
      allGood = false;
      console.error(`❌ ${check.name}: FALHA!`);
      const reason = !value ? "Não definida ou vazia." : "Formato incorreto.";
      console.error(`   -> Causa: ${reason}`);
      console.error(`   -> Verifique: ${check.message}`);
    }
  }

  console.log('---------------------------------------------------');

  if (allGood) {
    console.log('🎉 Parece que todas as variáveis essenciais estão configuradas! Podemos prosseguir.');
  } else {
    console.error('🔥 Encontrei problemas. Por favor, abra e corrija seu arquivo .env.local com base nas mensagens acima antes de continuar.');
  }
}

checkEnv();
