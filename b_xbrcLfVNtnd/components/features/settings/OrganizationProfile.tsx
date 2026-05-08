'use client'

import { useEffect, useState } from 'react'
import { 
  Building2, 
  Mail, 
  Globe, 
  Calendar, 
  Users, 
  Crown, 
  Check, 
  X,
  Edit2,
  Link,
  Shield,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganizationStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const timezones = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
]

const languages = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (United States)' },
]

export function OrganizationProfile() {
  const { organization, fetchOrganization, updateOrganization } = useOrganizationStore()
  const [isEditingBasic, setIsEditingBasic] = useState(false)
  const [isEditingSecurity, setIsEditingSecurity] = useState(false)
  const [basicFormData, setBasicFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    billingEmail: '',
  })
  const [securityFormData, setSecurityFormData] = useState({
    requireMFA: false,
    sessionTimeoutMinutes: 480,
    allowedDomains: [] as string[],
  })

  // Fetch organization data on mount
  useEffect(() => {
    if (organization.status === 'idle') {
      fetchOrganization()
    }
  }, [organization.status, fetchOrganization])

  // Update forms when organization data loads
  useEffect(() => {
    if (organization.status === 'success') {
      const org = organization.data
      setBasicFormData({
        name: org.name,
        slug: org.slug,
        domain: org.domain || '',
        billingEmail: org.billingEmail,
      })
      setSecurityFormData({
        requireMFA: org.settings.security.requireMFA,
        sessionTimeoutMinutes: org.settings.security.sessionTimeoutMinutes,
        allowedDomains: org.settings.security.allowedDomains,
      })
    }
  }, [organization])

  const handleSaveBasic = async () => {
    try {
      await updateOrganization(basicFormData)
      setIsEditingBasic(false)
      toast.success('Informações da organização atualizadas')
    } catch (error) {
      toast.error('Erro ao atualizar organização: ' + String(error))
    }
  }

  const handleSaveSecurity = async () => {
    try {
      await updateOrganization({
        settings: {
          security: securityFormData
        }
      })
      setIsEditingSecurity(false)
      toast.success('Configurações de segurança atualizadas')
    } catch (error) {
      toast.error('Erro ao atualizar segurança: ' + String(error))
    }
  }

  const handleCancelBasic = () => {
    if (organization.status === 'success') {
      const org = organization.data
      setBasicFormData({
        name: org.name,
        slug: org.slug,
        domain: org.domain || '',
        billingEmail: org.billingEmail,
      })
    }
    setIsEditingBasic(false)
  }

  const handleCancelSecurity = () => {
    if (organization.status === 'success') {
      const org = organization.data
      setSecurityFormData({
        requireMFA: org.settings.security.requireMFA,
        sessionTimeoutMinutes: org.settings.security.sessionTimeoutMinutes,
        allowedDomains: org.settings.security.allowedDomains,
      })
    }
    setIsEditingSecurity(false)
  }

  if (organization.status === 'loading') {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (organization.status === 'error') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-800/50 bg-red-950/50 p-4">
          <div className="flex items-center gap-3">
            <X className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Erro ao carregar organização</h3>
              <p className="text-sm text-red-300/80">{organization.error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (organization.status !== 'success') {
    return null
  }

  const org = organization.data

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-100">Organização</h1>
          <p className="text-zinc-400">
            Configure informações gerais, preferências e políticas de segurança da organização.
          </p>
        </div>

        {/* Organization Overview */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-zinc-700/50">
                  <AvatarImage src={org.logoUrl} alt={org.name} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-lg">
                    {org.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-zinc-100">{org.name}</h3>
                  <p className="text-sm text-zinc-400">@{org.slug}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs font-medium border-emerald-700/50 text-emerald-400 bg-emerald-950/50"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      {org.plan.name}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-medium",
                        org.status === 'active' 
                          ? "border-emerald-700/50 text-emerald-400 bg-emerald-950/50"
                          : "border-red-700/50 text-red-400 bg-red-950/50"
                      )}
                    >
                      {org.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{org.usedSeats}/{org.maxSeats === -1 ? '∞' : org.maxSeats} membros</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  <span>Criada em {org.createdAt.toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Information */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Informações Básicas</CardTitle>
                <CardDescription>
                  Configure o nome, identificador e domínio da organização.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingBasic(!isEditingBasic)}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditingBasic ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization Name */}
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-sm font-medium text-zinc-200">
                  Nome da Organização
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="org-name"
                    value={basicFormData.name}
                    onChange={(e) => setBasicFormData({ ...basicFormData, name: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                    placeholder="Nome da empresa"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Building2 className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">{org.name}</span>
                  </div>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="org-slug" className="text-sm font-medium text-zinc-200">
                  Identificador (Slug)
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="org-slug"
                    value={basicFormData.slug}
                    onChange={(e) => setBasicFormData({ ...basicFormData, slug: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                    placeholder="identificador-unico"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Link className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">@{org.slug}</span>
                  </div>
                )}
              </div>

              {/* Domain */}
              <div className="space-y-2">
                <Label htmlFor="org-domain" className="text-sm font-medium text-zinc-200">
                  Domínio Principal
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="org-domain"
                    value={basicFormData.domain}
                    onChange={(e) => setBasicFormData({ ...basicFormData, domain: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                    placeholder="exemplo.com.br"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Globe className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">{org.domain || 'Não configurado'}</span>
                  </div>
                )}
              </div>

              {/* Billing Email */}
              <div className="space-y-2">
                <Label htmlFor="billing-email" className="text-sm font-medium text-zinc-200">
                  Email de Cobrança
                </Label>
                {isEditingBasic ? (
                  <Input
                    id="billing-email"
                    type="email"
                    value={basicFormData.billingEmail}
                    onChange={(e) => setBasicFormData({ ...basicFormData, billingEmail: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                    placeholder="financeiro@exemplo.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">{org.billingEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditingBasic && (
              <>
                <Separator className="bg-zinc-800/50" />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelBasic}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveBasic}
                    disabled={organization.status === 'loading'}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Configurações de Segurança</CardTitle>
                <CardDescription>
                  Gerencie políticas de segurança e controle de acesso da organização.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingSecurity(!isEditingSecurity)}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <Shield className="h-4 w-4 mr-2" />
                {isEditingSecurity ? 'Cancelar' : 'Configurar'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-6">
              {/* MFA Requirement */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-zinc-200">
                    Exigir Autenticação Multifator (MFA)
                  </Label>
                  <p className="text-sm text-zinc-500">
                    Todos os membros devem ativar MFA para acessar a plataforma
                  </p>
                </div>
                <Switch
                  checked={isEditingSecurity ? securityFormData.requireMFA : org.settings.security.requireMFA}
                  onCheckedChange={isEditingSecurity ? 
                    (checked) => setSecurityFormData({ ...securityFormData, requireMFA: checked }) :
                    undefined
                  }
                  disabled={!isEditingSecurity}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>

              <Separator className="bg-zinc-800/50" />

              {/* Session Timeout */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">
                  Timeout de Sessão (minutos)
                </Label>
                <p className="text-sm text-zinc-500 mb-2">
                  Tempo em minutos antes que uma sessão inativa expire automaticamente
                </p>
                {isEditingSecurity ? (
                  <Select
                    value={String(securityFormData.sessionTimeoutMinutes)}
                    onValueChange={(value) => setSecurityFormData({ 
                      ...securityFormData, 
                      sessionTimeoutMinutes: parseInt(value) 
                    })}
                  >
                    <SelectTrigger className="w-48 bg-zinc-800/50 border-zinc-700 focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="240">4 horas</SelectItem>
                      <SelectItem value="480">8 horas</SelectItem>
                      <SelectItem value="720">12 horas</SelectItem>
                      <SelectItem value="1440">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50 w-48">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {org.settings.security.sessionTimeoutMinutes / 60} hora(s)
                    </span>
                  </div>
                )}
              </div>

              <Separator className="bg-zinc-800/50" />

              {/* Allowed Domains */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">
                  Domínios Permitidos
                </Label>
                <p className="text-sm text-zinc-500">
                  Apenas emails destes domínios podem ser convidados
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {org.settings.security.allowedDomains.map((domain) => (
                    <Badge
                      key={domain}
                      variant="outline"
                      className="text-xs border-blue-700/50 text-blue-400 bg-blue-950/50"
                    >
                      {domain}
                    </Badge>
                  ))}
                  {org.settings.security.allowedDomains.length === 0 && (
                    <span className="text-sm text-zinc-500">Nenhum domínio configurado</span>
                  )}
                </div>
              </div>
            </div>

            {isEditingSecurity && (
              <>
                <Separator className="bg-zinc-800/50" />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelSecurity}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveSecurity}
                    disabled={organization.status === 'loading'}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Plan Information */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Plano Atual</CardTitle>
            <CardDescription>
              Informações sobre seu plano e limites de uso.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">Plano</Label>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300 font-medium">{org.plan.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">Preço Mensal</Label>
                <div className="text-zinc-300">
                  {org.plan.monthlyPrice > 0 ? 
                    `R$ ${org.plan.monthlyPrice.toFixed(2)}` : 
                    'Gratuito'
                  }
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">Usuários</Label>
                <div className="text-zinc-300">
                  {org.usedSeats}/{org.maxSeats === -1 ? '∞' : org.maxSeats}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}