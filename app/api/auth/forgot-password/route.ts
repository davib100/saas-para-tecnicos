import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Não exponha a chave de serviço no lado do cliente!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'E-mail é obrigatório.' }, { status: 400 });
    }

    // O Supabase irá lidar com o envio do e-mail de redefinição.
    // A URL de redirecionamento DEVE estar configurada nos templates de e-mail do seu projeto Supabase.
    // Vá para: Authentication -> Email Templates -> Reset Password
    // A URL padrão é {{ .SiteURL }}/api/auth/callback , mas você deve apontar para a sua página de redefinição.
    // Para este fluxo, o ideal é algo como: http://localhost:3000/reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Esta é a URL para a qual o usuário será enviado após clicar no link do e-mail
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    });

    if (error) {
      // Mesmo em caso de erro do Supabase (ex: usuário não encontrado), não revelamos a informação.
      // Logamos o erro para depuração, mas retornamos uma mensagem genérica.
      console.error('Supabase reset password error:', error.message);
      // A mensagem para o usuário é a mesma para evitar enumeração de e-mail.
      return NextResponse.json({ message: 'Se este e-mail estiver cadastrado, um link de redefinição será enviado.' });
    }

    return NextResponse.json({ message: 'Se este e-mail estiver cadastrado, um link de redefinição será enviado.' });

  } catch (err) {
    console.error('Forgot password API error:', err);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
