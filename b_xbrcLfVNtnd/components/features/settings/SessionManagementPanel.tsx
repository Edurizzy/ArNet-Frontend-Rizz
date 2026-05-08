'use client'

import { useEffect } from 'react'
import { Monitor, Smartphone, Tablet, Globe, Trash2, Shield } from 'lucide-react'
import { useSessionManagementStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'desktop': return Monitor
    case 'mobile': return Smartphone
    case 'tablet': return Tablet
    default: return Monitor
  }
}

export function SessionManagementPanel() {
  const { 
    activeSessions, 
    revokeInProgress,
    fetchActiveSessions, 
    revokeSession, 
    revokeAllSessions 
  } = useSessionManagementStore()

  useEffect(() => {
    if (activeSessions.status === 'idle') {
      fetchActiveSessions()
    }
  }, [activeSessions.status, fetchActiveSessions])

  const handleRevokeSession = async (sessionId: string, isCurrent: boolean) => {
    if (isCurrent) {
      toast.error('Não é possível revogar a sessão atual')
      return
    }

    try {
      await revokeSession(sessionId)
      toast.success('Sessão revogada com sucesso')
    } catch (error) {
      toast.error('Erro ao revogar sessão: ' + String(error))
    }
  }

  const handleRevokeAllSessions = async () => {
    if (!confirm('Tem certeza que deseja revogar todas as outras sessões? Você será desconectado de todos os outros dispositivos.')) {
      return
    }

    try {
      await revokeAllSessions()
      toast.success('Todas as sessões foram revogadas')
    } catch (error) {
      toast.error('Erro ao revogar sessões: ' + String(error))
    }
  }

  if (activeSessions.status === 'loading') {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-zinc-100">Sessões Ativas</h1>
            <p className="text-zinc-400">
              Gerencie dispositivos e sessões conectadas à sua conta.
            </p>
          </div>

          {activeSessions.status === 'success' && activeSessions.data.length > 1 && (
            <Button 
              variant="outline"
              onClick={handleRevokeAllSessions}
              className="border-red-700/50 text-red-400 hover:bg-red-950/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Revogar Todas
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {activeSessions.status === 'success' && activeSessions.data.map((session) => {
            const DeviceIcon = getDeviceIcon(session.deviceInfo.type)
            const isRevoking = revokeInProgress.has(session.id)

            return (
              <Card key={session.id} className="bg-zinc-900/50 border-zinc-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-zinc-800/50">
                        <DeviceIcon className="h-6 w-6 text-zinc-400" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-zinc-200">
                            {session.deviceInfo.browser || 'Navegador Desconhecido'} em {session.deviceInfo.os || 'Sistema Desconhecido'}
                          </h3>
                          {session.isCurrent && (
                            <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700">
                              Sessão Atual
                            </Badge>
                          )}
                          {session.isTrusted && (
                            <Badge variant="outline" className="text-xs border-blue-700/50 text-blue-400 bg-blue-950/50">
                              <Shield className="h-3 w-3 mr-1" />
                              Confiável
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{session.ipAddress}</span>
                          </div>
                          {session.location && (
                            <span>
                              {session.location.city}, {session.location.country}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-zinc-500">
                          Iniciada em {session.startedAt.toLocaleDateString('pt-BR')} • 
                          Último acesso {session.lastActiveAt.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!session.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id, session.isCurrent)}
                          disabled={isRevoking}
                          className="border-red-700/50 text-red-400 hover:bg-red-950/50"
                        >
                          {isRevoking ? (
                            'Revogando...'
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revogar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {activeSessions.status === 'success' && activeSessions.data.length === 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-12 text-center">
              <Monitor className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">Nenhuma sessão ativa</h3>
              <p className="text-zinc-500">
                Suas sessões ativas aparecerão aqui quando você fizer login.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}