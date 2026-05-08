'use client'

import { useEffect } from 'react'
import { Shield, Users, Eye, Edit, Trash, Key } from 'lucide-react'
import { useRoleManagementStore } from '@/stores/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

const scopeLabels = {
  organization: 'Organização',
  team: 'Equipe',
  atendimento: 'Atendimento',
  clientes: 'Clientes',
  'ai-studio': 'AI Studio',
  automacoes: 'Automações',
  dashboard: 'Dashboard',
  settings: 'Configurações',
  billing: 'Faturamento',
  audit: 'Auditoria',
  'api-keys': 'Chaves API',
  webhooks: 'Webhooks',
}

const actionIcons = {
  read: Eye,
  create: Edit,
  update: Edit,
  delete: Trash,
  manage: Key,
}

export function RolePermissionMatrix() {
  const { permissionMatrix, fetchPermissionMatrix } = useRoleManagementStore()

  useEffect(() => {
    if (permissionMatrix.status === 'idle') {
      fetchPermissionMatrix()
    }
  }, [permissionMatrix.status, fetchPermissionMatrix])

  if (permissionMatrix.status === 'loading') {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-100">Matriz de Permissões</h1>
          <p className="text-zinc-400">
            Visualize e gerencie permissões granulares para cada cargo da organização.
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Controle de Acesso por Cargo
            </CardTitle>
            <CardDescription>
              Matriz de permissões mostrando quais ações cada cargo pode executar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50">
                    <TableHead className="text-zinc-300 font-semibold w-48">
                      Escopo / Cargo
                    </TableHead>
                    {permissionMatrix.status === 'success' && 
                      permissionMatrix.data.map((role) => (
                        <TableHead key={role.roleId} className="text-center min-w-32">
                          <div className="space-y-1">
                            <Badge 
                              variant="outline" 
                              className="text-xs border-emerald-700/50 text-emerald-400 bg-emerald-950/50"
                            >
                              {role.roleName}
                            </Badge>
                          </div>
                        </TableHead>
                      ))
                    }
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(scopeLabels).map(([scope, label]) => (
                    <TableRow key={scope} className="border-zinc-800/50 hover:bg-zinc-800/20">
                      <TableCell className="font-medium text-zinc-200">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          {label}
                        </div>
                      </TableCell>
                      {permissionMatrix.status === 'success' && 
                        permissionMatrix.data.map((role) => {
                          const rolePermission = role.permissions.find(p => p.scope === scope)
                          const hasPermission = rolePermission?.granted || false
                          
                          return (
                            <TableCell key={`${role.roleId}-${scope}`} className="text-center">
                              <div className="flex justify-center">
                                <Switch
                                  checked={hasPermission}
                                  disabled={true} // Read-only for now
                                  className="data-[state=checked]:bg-emerald-600"
                                />
                              </div>
                            </TableCell>
                          )
                        })
                      }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}