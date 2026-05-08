'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Globe, Calendar, Shield, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganizationStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
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

export function ProfileSettings() {
  const { currentUser, fetchCurrentUser, updateProfile } = useOrganizationStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
  })

  // Fetch current user data on mount
  useEffect(() => {
    if (currentUser.status === 'idle') {
      fetchCurrentUser()
    }
  }, [currentUser.status, fetchCurrentUser])

  // Update form when user data loads
  useEffect(() => {
    if (currentUser.status === 'success') {
      setFormData({
        name: currentUser.data.name,
        email: currentUser.data.email,
        timezone: 'America/Sao_Paulo', // Default since not in mock data
        language: 'pt-BR', // Default since not in mock data
      })
    }
  }, [currentUser])

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
      toast.success('Perfil atualizado com sucesso')
    } catch (error) {
      toast.error('Erro ao atualizar perfil: ' + String(error))
    }
  }

  const handleCancel = () => {
    if (currentUser.status === 'success') {
      setFormData({
        name: currentUser.data.name,
        email: currentUser.data.email,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      })
    }
    setIsEditing(false)
  }

  if (currentUser.status === 'loading') {
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

  if (currentUser.status === 'error') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-800/50 bg-red-950/50 p-4">
          <div className="flex items-center gap-3">
            <X className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Erro ao carregar perfil</h3>
              <p className="text-sm text-red-300/80">{currentUser.error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentUser.status !== 'success') {
    return null
  }

  const user = currentUser.data

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-100">Meu Perfil</h1>
          <p className="text-zinc-400">
            Gerencie suas informações pessoais, preferências e configurações de conta.
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-zinc-700/50">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-zinc-100">{user.name}</h3>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-medium border-emerald-700/50 text-emerald-400 bg-emerald-950/50"
                      )}
                    >
                      {user.role.name}
                    </Badge>
                    {user.mfaEnabled && (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-blue-700/50 text-blue-400 bg-blue-950/50"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        MFA Ativo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm text-zinc-500">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {user.joinedAt?.toLocaleDateString('pt-BR') || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Último acesso {user.lastActiveAt?.toLocaleString('pt-BR') || 'Nunca'}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Information Card */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Informações Pessoais</CardTitle>
                <CardDescription>
                  Mantenha suas informações atualizadas para melhor comunicação da equipe.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-zinc-200">
                  Nome Completo
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <User className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">{user.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                    placeholder="seu.email@exemplo.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Timezone Field */}
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium text-zinc-200">
                  Fuso Horário
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Globe className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {timezones.find(tz => tz.value === formData.timezone)?.label || 'São Paulo (GMT-3)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Language Field */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium text-zinc-200">
                  Idioma
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/30 border border-zinc-800/50">
                    <Globe className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300">
                      {languages.find(lang => lang.value === formData.language)?.label || 'Português (Brasil)'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <>
                <Separator className="bg-zinc-800/50" />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={currentUser.status === 'loading'}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {currentUser.status === 'loading' ? (
                      <>Salvando...</>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">Status da Conta</CardTitle>
            <CardDescription>
              Informações sobre sua conta e permissões na organização.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">Status</Label>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                  )} />
                  <span className={cn(
                    'text-sm font-medium capitalize',
                    user.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">Sessões Ativas</Label>
                <div className="text-sm text-zinc-300">{user.sessionCount} dispositivos</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-zinc-200">Permissões</Label>
                <div className="text-sm text-zinc-300">{user.permissions.length} escopos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}