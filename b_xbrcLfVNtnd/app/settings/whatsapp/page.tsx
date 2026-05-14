'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Save,
  ShieldAlert,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { canManageWhatsAppIntegration } from '@/lib/auth-roles'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  DEFAULT_AUTO_GREETING_MESSAGE,
  formatApiError,
  getPrimaryWhatsAppAccount,
  mapAccountToFormSnapshot,
  saveWhatsAppSettings,
  type SaveWhatsAppSettingsInput,
} from '@/services/whatsapp-settings-api'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export default function WhatsAppSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const allowed = useMemo(() => canManageWhatsAppIntegration(user?.role), [user?.role])

  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [accountId, setAccountId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [companyWhatsappNumber, setCompanyWhatsappNumber] = useState('')
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('')
  const [integrationActive, setIntegrationActive] = useState(true)
  const [autoGreetingEnabled, setAutoGreetingEnabled] = useState(false)
  const [autoGreetingMessage, setAutoGreetingMessage] = useState(DEFAULT_AUTO_GREETING_MESSAGE)
  const [accessTokenHint, setAccessTokenHint] = useState('')
  const [webhookVerifyTokenHint, setWebhookVerifyTokenHint] = useState('')

  const load = useCallback(async () => {
    setLoadStatus('loading')
    setLoadError(null)
    try {
      const account = await getPrimaryWhatsAppAccount()
      if (!mountedRef.current) return
      const snap = mapAccountToFormSnapshot(account)
      setAccountId(snap.id)
      setDisplayName(snap.displayName)
      setCompanyWhatsappNumber(snap.companyWhatsappNumber)
      setMetaPhoneNumberId(snap.metaPhoneNumberId)
      setAccessToken('')
      setWebhookVerifyToken('')
      setIntegrationActive(snap.integrationActive)
      setAutoGreetingEnabled(snap.autoGreetingEnabled)
      setAutoGreetingMessage(snap.autoGreetingMessage || DEFAULT_AUTO_GREETING_MESSAGE)
      setAccessTokenHint(snap.accessTokenHint)
      setWebhookVerifyTokenHint(snap.webhookVerifyTokenHint)
      setLoadStatus('ready')
    } catch {
      if (!mountedRef.current) return
      setLoadError('Não foi possível carregar a configuração do WhatsApp.')
      setLoadStatus('error')
      toast.error('Erro ao carregar configurações do WhatsApp.')
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || !allowed) return
    void load()
  }, [allowed, isHydrated, load])

  const connectionLabel = useMemo(() => {
    if (!integrationActive) return { text: 'Integração desativada', variant: 'warning' as const }
    if (accessTokenHint) return { text: 'WhatsApp conectado', variant: 'success' as const }
    return { text: 'Ativo — configure o token de acesso', variant: 'pending' as const }
  }, [accessTokenHint, integrationActive])

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Informe o nome de exibição.')
      return
    }
    if (!metaPhoneNumberId.trim()) {
      toast.error('Informe o ID do número de telefone na Meta.')
      return
    }
    if (!accountId) {
      if (!accessToken.trim()) {
        toast.error('Na primeira configuração, o token de acesso é obrigatório.')
        return
      }
      if (!webhookVerifyToken.trim()) {
        toast.error('Na primeira configuração, o token de verificação do webhook é obrigatório.')
        return
      }
    }

    const payload: SaveWhatsAppSettingsInput = {
      id: accountId,
      displayName: displayName.trim(),
      companyWhatsappNumber: companyWhatsappNumber.trim(),
      metaPhoneNumberId: metaPhoneNumberId.trim(),
      accessToken,
      webhookVerifyToken,
      integrationActive,
      autoGreetingEnabled,
      autoGreetingMessage: autoGreetingMessage.trim() || DEFAULT_AUTO_GREETING_MESSAGE,
    }

    setSaving(true)
    try {
      const saved = await saveWhatsAppSettings(payload)
      const snap = mapAccountToFormSnapshot(saved)
      setAccountId(snap.id)
      setAccessToken('')
      setWebhookVerifyToken('')
      setAccessTokenHint(snap.accessTokenHint)
      setWebhookVerifyTokenHint(snap.webhookVerifyTokenHint)
      toast.success('Configurações do WhatsApp salvas.')
    } catch (err) {
      toast.error(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-10 w-64 bg-zinc-800" />
          <Skeleton className="h-48 w-full bg-zinc-800" />
          <Skeleton className="h-48 w-full bg-zinc-800" />
        </div>
        <Toaster theme="dark" position="top-center" richColors closeButton />
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
        <div className="mx-auto max-w-lg pt-16">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-10 w-10 text-amber-400" aria-hidden />
                <div>
                  <CardTitle className="text-xl">Acesso restrito</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Apenas administradores e gerentes podem alterar a integração WhatsApp da organização.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild variant="secondary" className="border-zinc-700 bg-zinc-800 text-zinc-100">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao painel
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Toaster theme="dark" position="top-center" richColors closeButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 sm:p-8">
      <Toaster theme="dark" position="top-center" richColors closeButton />

      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 mb-2 h-8 px-2 text-zinc-400 hover:text-zinc-100"
            >
              <Link href="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Painel
              </Link>
            </Button>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-50">
              <MessageCircle className="h-7 w-7 text-emerald-400" aria-hidden />
              WhatsApp — Configurações
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              Configure a API em nuvem da Meta, o número da empresa e a mensagem automática de boas-vindas. Somente
              WhatsApp — sem outros canais.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                'border px-3 py-1 text-xs font-medium',
                connectionLabel.variant === 'success' &&
                  'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                connectionLabel.variant === 'pending' &&
                  'border-amber-500/40 bg-amber-500/10 text-amber-200',
                connectionLabel.variant === 'warning' &&
                  'border-zinc-600 bg-zinc-800/80 text-zinc-300'
              )}
            >
              {connectionLabel.variant === 'success' ? (
                <Wifi className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              ) : connectionLabel.variant === 'warning' ? (
                <WifiOff className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              ) : (
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              )}
              {connectionLabel.text}
            </Badge>
            {!integrationActive && (
              <Badge variant="outline" className="border-amber-600/50 text-amber-200">
                Integração desligada
              </Badge>
            )}
          </div>
        </div>

        {loadStatus === 'loading' || loadStatus === 'idle' ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full bg-zinc-800" />
            <Skeleton className="h-40 w-full bg-zinc-800" />
          </div>
        ) : loadStatus === 'error' ? (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="flex flex-col gap-4 pt-6">
              <p className="text-sm text-zinc-400">{loadError}</p>
              <Button type="button" variant="secondary" onClick={() => void load()} className="w-fit">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {!accountId && (
              <Card className="border-emerald-900/40 bg-emerald-950/20">
                <CardContent className="flex gap-3 pt-6 text-sm text-emerald-100/90">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                  <p>
                    Primeira configuração: informe o token de acesso e o token de verificação do webhook. Depois do
                    primeiro salvamento, novos tokens podem ficar em branco para manter os valores já armazenados com
                    segurança no servidor.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-zinc-800 bg-zinc-900/40">
              <CardHeader>
                <CardTitle className="text-lg">WhatsApp Cloud API (Meta)</CardTitle>
                <CardDescription className="text-zinc-400">
                  Credenciais e identificadores usados para receber e enviar mensagens pelo WhatsApp Business.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="displayName">Nome de exibição</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ex.: ArNet — Atendimento"
                      autoComplete="organization"
                      className="border-zinc-700 bg-zinc-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWhatsappNumber">Número WhatsApp da empresa</Label>
                    <Input
                      id="companyWhatsappNumber"
                      value={companyWhatsappNumber}
                      onChange={(e) => setCompanyWhatsappNumber(e.target.value)}
                      placeholder="+55 11 99999-0000"
                      autoComplete="tel"
                      className="border-zinc-700 bg-zinc-950"
                    />
                    <p className="text-xs text-zinc-500">Referência operacional; o roteamento usa o ID da Meta abaixo.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaPhoneNumberId">ID do número de telefone (Meta)</Label>
                    <Input
                      id="metaPhoneNumberId"
                      value={metaPhoneNumberId}
                      onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                      placeholder="Phone Number ID do painel Meta"
                      className="border-zinc-700 bg-zinc-950"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="accessToken">Token de acesso</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder={accessTokenHint ? 'Deixe em branco para manter o token atual' : 'Cole o token permanente ou temporário'}
                      autoComplete="new-password"
                      className="border-zinc-700 bg-zinc-950"
                    />
                    {accessTokenHint ? (
                      <p className="text-xs text-zinc-500">
                        Token armazenado (máscara): <span className="font-mono text-zinc-400">{accessTokenHint}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-200/80">Nenhum token salvo ainda — informe um token para ativar o envio.</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="webhookVerifyToken">Token de verificação do webhook</Label>
                    <Input
                      id="webhookVerifyToken"
                      type="password"
                      value={webhookVerifyToken}
                      onChange={(e) => setWebhookVerifyToken(e.target.value)}
                      placeholder={
                        webhookVerifyTokenHint
                          ? 'Deixe em branco para manter o token atual'
                          : 'Defina um segredo e use o mesmo na Meta'
                      }
                      autoComplete="new-password"
                      className="border-zinc-700 bg-zinc-950"
                    />
                    {webhookVerifyTokenHint ? (
                      <p className="text-xs text-zinc-500">
                        Valor atual (máscara): <span className="font-mono text-zinc-400">{webhookVerifyTokenHint}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Label htmlFor="integrationActive" className="text-base">
                      Integração ativa
                    </Label>
                    <p className="text-sm text-zinc-500">Quando desligada, o sistema não deve usar esta conta para envio.</p>
                  </div>
                  <Switch
                    id="integrationActive"
                    checked={integrationActive}
                    onCheckedChange={setIntegrationActive}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/40">
              <CardHeader>
                <CardTitle className="text-lg">Primeira resposta automática</CardTitle>
                <CardDescription className="text-zinc-400">
                  Texto da primeira resposta automática no WhatsApp. Os dados são salvos na conta conectada para a
                  plataforma aplicar na operação de atendimento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Label htmlFor="autoGreeting" className="text-base">
                    Ativar saudação automática
                  </Label>
                  <Switch
                    id="autoGreeting"
                    checked={autoGreetingEnabled}
                    onCheckedChange={setAutoGreetingEnabled}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="greetingMessage">Mensagem de saudação</Label>
                  <Textarea
                    id="greetingMessage"
                    value={autoGreetingMessage}
                    onChange={(e) => setAutoGreetingMessage(e.target.value)}
                    rows={4}
                    disabled={!autoGreetingEnabled}
                    className="resize-y border-zinc-700 bg-zinc-950 disabled:opacity-60"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar configurações
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
