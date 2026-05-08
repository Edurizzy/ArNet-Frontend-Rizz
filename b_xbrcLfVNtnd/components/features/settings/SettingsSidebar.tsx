'use client'

import { 
  User, 
  Settings, 
  Monitor,
  Building2,
  Users,
  CreditCard,
  Flag,
  Key,
  Webhook,
  Shield,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsNavigationStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { SettingsPageId, SettingsNavSection } from '@/types/settings'

// Navigation configuration with enterprise-grade sections
const navigationSections: SettingsNavSection[] = [
  {
    id: 'personal',
    label: 'Pessoal',
    items: [
      {
        id: 'profile',
        label: 'Meu Perfil',
        icon: 'User',
        description: 'Informações pessoais e preferências',
      },
      {
        id: 'preferences',
        label: 'Preferências',
        icon: 'Settings',
        description: 'Tema, idioma e notificações',
        badge: 'Em breve',
      },
      {
        id: 'sessions',
        label: 'Sessões Ativas',
        icon: 'Monitor',
        description: 'Gerenciar dispositivos e sessões',
      },
    ],
  },
  {
    id: 'organization',
    label: 'Organização',
    items: [
      {
        id: 'organization',
        label: 'Geral',
        icon: 'Building2',
        description: 'Configurações da organização',
      },
      {
        id: 'team',
        label: 'Equipe & RBAC',
        icon: 'Users',
        description: 'Gerenciar membros e permissões',
      },
      {
        id: 'billing',
        label: 'Faturamento & Plano',
        icon: 'CreditCard',
        description: 'Planos, cobrança e faturas',
        badge: 'Em breve',
      },
      {
        id: 'feature-flags',
        label: 'Feature Flags',
        icon: 'Flag',
        description: 'Controle de recursos e experimentos',
        badge: 'Em breve',
      },
    ],
  },
  {
    id: 'developer',
    label: 'Desenvolvedor',
    items: [
      {
        id: 'api-keys',
        label: 'Chaves de API',
        icon: 'Key',
        description: 'Autenticação para integrações',
      },
      {
        id: 'webhooks',
        label: 'Webhooks',
        icon: 'Webhook',
        description: 'Notificações em tempo real',
        badge: 'Em breve',
      },
      {
        id: 'audit-logs',
        label: 'Logs de Auditoria',
        icon: 'FileText',
        description: 'Histórico de ações e segurança',
      },
    ],
  },
  {
    id: 'security',
    label: 'Segurança',
    items: [
      {
        id: 'security',
        label: 'Matriz de Permissões',
        icon: 'Shield',
        description: 'Controle de acesso granular',
      },
      {
        id: 'danger-zone',
        label: 'Zona Perigosa',
        icon: 'AlertTriangle',
        description: 'Ações irreversíveis',
      },
    ],
  },
]

// Icon mapping
const iconMap = {
  User,
  Settings,
  Monitor,
  Building2,
  Users,
  CreditCard,
  Flag,
  Key,
  Webhook,
  FileText,
  Shield,
  AlertTriangle,
}

export function SettingsSidebar() {
  const { currentPage, sidebarOpen, setCurrentPage, toggleSidebar } = useSettingsNavigationStore()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Settings className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Configurações</h2>
            <p className="text-xs text-zinc-500">Organização & Segurança</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0 hover:bg-zinc-800/60"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <nav className="space-y-8">
          {navigationSections.map((section) => (
            <div key={section.id}>
              {/* Section Header */}
              <div className="mb-3 px-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {section.label}
                </h3>
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap]
                  const isActive = currentPage === item.id
                  const isDangerZone = item.id === 'danger-zone'

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        'hover:bg-zinc-800/60',
                        isActive && 'bg-zinc-800/80 text-emerald-400 font-medium',
                        isActive && 'shadow-sm',
                        isDangerZone && !isActive && 'hover:bg-red-950/50',
                        isDangerZone && isActive && 'bg-red-950/80 text-red-400',
                        !isActive && 'text-zinc-300'
                      )}
                    >
                      <Icon className={cn(
                        'h-4 w-4 shrink-0',
                        isActive && !isDangerZone && 'text-emerald-400',
                        isActive && isDangerZone && 'text-red-400',
                        !isActive && !isDangerZone && 'text-zinc-400',
                        !isActive && isDangerZone && 'text-red-500'
                      )} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "ml-2 text-xs px-2 py-0.5 h-5",
                                "bg-zinc-700/50 text-zinc-400 border-zinc-600/50"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className={cn(
                            'text-xs truncate mt-0.5',
                            isActive ? 'text-zinc-400' : 'text-zinc-500'
                          )}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Section separator */}
              {section.id !== 'security' && (
                <Separator className="mt-6 bg-zinc-800/50" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/50 px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Configurações Sincronizadas</span>
        </div>
      </div>
    </div>
  )
}