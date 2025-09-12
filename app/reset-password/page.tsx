'use client'

import type React from 'react'
import { useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ArrowLeft } from 'lucide-react'

// Esta é a abordagem final e mais robusta.
// A lógica de atualização acontece inteiramente no cliente, eliminando
// os problemas de sincronização de sessão com uma API de backend.

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // O Supabase Auth Helper detecta automaticamente o token da URL e cria a sessão.
  // Não precisamos mais de lógica manual para extrair o token ou esperar por um evento.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // A biblioteca Supabase usa a sessão que foi estabelecida a partir do token na URL
      // para autorizar esta chamada de atualização.
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Invalida a sessão atual para garantir que o usuário precise fazer login com a nova senha.
      await supabase.auth.signOut();

      router.push(`/login?message=${encodeURIComponent('Sua senha foi redefinida com sucesso!')}`);

    } catch (err) {
      setError(err instanceof Error ? `Erro ao redefinir a senha: ${err.message}. O link pode ter expirado.` : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md'>
      <Card>
        <CardHeader>
          <CardTitle>Crie sua Nova Senha</CardTitle>
          <CardDescription>Insira e confirme sua nova senha abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className='text-red-500 text-sm text-center mb-4 p-3 bg-red-50 rounded-md'>{error}</p>}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='password'>Nova Senha</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  className='pl-10'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirm-password'>Confirmar Nova Senha</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  id='confirm-password'
                  type='password'
                  placeholder='••••••••'
                  className='pl-10'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
          <div className='mt-4 text-center text-sm'>
            <Link href='/login' className='underline text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2'>
              <ArrowLeft size={14} /> Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Suspense fallback={<div>Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
