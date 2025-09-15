'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro. Tente novamente.')
      }

      // Exibe a mensagem de sucesso e impede novos envios
      setSuccess(true)
      
      // Redireciona o usuário de volta para o login após 5 segundos
      setTimeout(() => {
        router.push(`/login?message=${encodeURIComponent('Se o e-mail estiver cadastrado, um link de redefinição foi enviado.')}`)
      }, 5000)

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocorreu um erro desconhecido.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card>
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              {success
                ? 'Verifique sua caixa de entrada para o próximo passo.'
                : 'Digite seu e-mail para receber um link de redefinição.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className='text-center space-y-4 p-4'>
                <p className='text-green-700 font-medium'>
                  Link de redefinição enviado para <strong>{email}</strong>.
                </p>
                <p className='text-sm text-gray-600'>
                  Você será redirecionado para a tela de login em instantes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-6'>
                {error && <p className='text-red-500 text-sm text-center'>{error}</p>}
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email de Cadastro</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                    <Input
                      id='email'
                      type='email'
                      placeholder='seu@email.com'
                      className='pl-10'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                </Button>
              </form>
            )}
            <div className='mt-4 text-center text-sm'>
              <Link href='/login' className='underline text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2'>
                <ArrowLeft size={14} /> Voltar para o Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
