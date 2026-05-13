'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { loginWithCredentials } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return isValidEmail(email) && password.length >= 1 && !isSubmitting
  }, [email, isSubmitting, password])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)

    try {
      await loginWithCredentials(email.trim(), password)
      router.replace('/')
    } catch {
      setError('Email ou senha inválidos. Verifique suas credenciais e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-zinc-950 text-zinc-100 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-zinc-800/70 bg-zinc-950 p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_28%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            ArNet Enterprise Control Plane
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-zinc-50">
            Atendimento realtime com identidade, tenant isolation e operação segura.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">
            A sessão autentica REST, WebSockets e reconciliação realtime com o mesmo JWT.
            É como um crachá corporativo: cada request e conexão carrega quem você é e qual organização pode acessar.
          </p>
        </div>

        <div className="relative grid max-w-xl grid-cols-3 gap-3 text-xs text-zinc-500">
          {['JWT protegido', 'Socket autenticado', 'Tenant seguro'].map((item) => (
            <div key={item} className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3">
              <div className="mb-2 h-1.5 w-8 rounded-full bg-emerald-400/70" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
              <LockKeyhole className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-50">Entrar no workspace</h2>
              <p className="text-sm text-zinc-500">Use sua conta corporativa ArNet.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com"
                aria-invalid={Boolean(email && !isValidEmail(email))}
                className="h-11 border-zinc-800 bg-zinc-900/70 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-zinc-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                className="h-11 border-zinc-800 bg-zinc-900/70 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'h-11 w-full bg-emerald-600 font-medium text-white hover:bg-emerald-500',
                'disabled:bg-zinc-800 disabled:text-zinc-500'
              )}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar com segurança
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
