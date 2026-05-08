'use client'

import { useEffect } from 'react'
import { FileText, Search, Filter, Calendar, User, Activity } from 'lucide-react'
import { useAuditLogsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive" className="text-xs">Crítico</Badge>
    case 'high':
      return <Badge className="text-xs bg-red-600 hover:bg-red-700">Alto</Badge>
    case 'medium':
      return <Badge className="text-xs bg-yellow-600 hover:bg-yellow-700">Médio</Badge>
    case 'low':
      return <Badge variant="secondary" className="text-xs">Baixo</Badge>
    default:
      return <Badge variant="outline" className="text-xs">Info</Badge>
  }
}

const getActionLabel = (actionType: string) => {
  const actionLabels: Record<string, string> = {
    'user.login': 'Login de Usuário',
    'user.logout': 'Logout de Usuário',
    'user.role.change': 'Alteração de Cargo',
    'apikey.create': 'Criação de Chave API',
    'apikey.revoke': 'Revogação de Chave API',
    'settings.update': 'Atualização de Configurações',
  }
  return actionLabels[actionType] || actionType
}

export function SecurityAuditPanel() {
  const { auditLogs, filters, fetchAuditLogs, setFilters } = useAuditLogsStore()

  useEffect(() => {
    if (auditLogs.status === 'idle') {
      fetchAuditLogs()
    }
  }, [auditLogs.status, fetchAuditLogs])

  if (auditLogs.status === 'loading') {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-100">Logs de Auditoria</h1>
          <p className="text-zinc-400">
            Monitore todas as ações e eventos de segurança da organização.
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por usuário, ação ou recurso..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                />
              </div>
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Histórico de Auditoria
            </CardTitle>
            <CardDescription>
              Registro completo de ações executadas na plataforma.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50">
                    <TableHead className="text-zinc-300">Timestamp</TableHead>
                    <TableHead className="text-zinc-300">Usuário</TableHead>
                    <TableHead className="text-zinc-300">Ação</TableHead>
                    <TableHead className="text-zinc-300">Recurso</TableHead>
                    <TableHead className="text-zinc-300">Severidade</TableHead>
                    <TableHead className="text-zinc-300">Status</TableHead>
                    <TableHead className="text-zinc-300">IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.status === 'success' && auditLogs.data.logs.map((log) => (
                    <TableRow key={log.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-zinc-300">
                            {log.timestamp.toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-zinc-500 text-xs">
                            {log.timestamp.toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-500" />
                          <div>
                            <div className="text-sm text-zinc-300">{log.actor.name}</div>
                            <div className="text-xs text-zinc-500">{log.actor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="text-sm text-zinc-300">
                            {getActionLabel(log.action.type)}
                          </div>
                          <div className="text-xs text-zinc-500">{log.action.description}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-zinc-300">{log.resource.type}</div>
                          <div className="text-xs text-zinc-500 font-mono">{log.resource.id}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getSeverityBadge(log.severity)}
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            log.status === 'success'
                              ? "border-emerald-700/50 text-emerald-400 bg-emerald-950/50"
                              : log.status === 'failure'
                              ? "border-red-700/50 text-red-400 bg-red-950/50"
                              : "border-yellow-700/50 text-yellow-400 bg-yellow-950/50"
                          }
                        >
                          {log.status === 'success' ? 'Sucesso' : 
                           log.status === 'failure' ? 'Falha' : 'Aviso'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <code className="text-xs bg-zinc-800/50 px-2 py-1 rounded text-zinc-400">
                          {log.ipAddress}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {auditLogs.status === 'success' && auditLogs.data.logs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">Nenhum log encontrado</h3>
                <p className="text-zinc-500">
                  Os logs de auditoria aparecerão aqui conforme as ações são executadas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}