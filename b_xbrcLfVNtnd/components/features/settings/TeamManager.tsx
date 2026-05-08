'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Shield, 
  ShieldX,
  Trash2,
  Edit3,
  Mail,
  Calendar,
  Filter,
  X,
  Check,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTeamMembersStore, useRoleManagementStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { InviteMemberDialog } from './InviteMemberDialog'
import { toast } from 'sonner'
import type { TeamMember } from '@/types/settings'

const getStatusBadge = (status: TeamMember['status']) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="outline" className="text-xs border-emerald-700/50 text-emerald-400 bg-emerald-950/50">
          Ativo
        </Badge>
      )
    case 'suspended':
      return (
        <Badge variant="outline" className="text-xs border-red-700/50 text-red-400 bg-red-950/50">
          Suspenso
        </Badge>
      )
    case 'pending':
      return (
        <Badge variant="outline" className="text-xs border-yellow-700/50 text-yellow-400 bg-yellow-950/50">
          Pendente
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-xs border-zinc-700/50 text-zinc-400 bg-zinc-950/50">
          Inativo
        </Badge>
      )
  }
}

const getRoleBadge = (roleName: string, roleLevel: string) => {
  const isHighPrivilege = ['owner', 'admin'].includes(roleLevel)
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium",
        isHighPrivilege 
          ? "border-purple-700/50 text-purple-400 bg-purple-950/50" 
          : "border-blue-700/50 text-blue-400 bg-blue-950/50"
      )}
    >
      {isHighPrivilege && <Shield className="h-3 w-3 mr-1" />}
      {roleName}
    </Badge>
  )
}

export function TeamManager() {
  const {
    members,
    filters,
    selectedMemberIds,
    inviteDialogOpen,
    fetchMembers,
    changeRole,
    suspendMember,
    removeMember,
    setFilters,
    toggleSelection,
    selectAll,
    clearSelection,
    setInviteDialogOpen,
  } = useTeamMembersStore()

  const { roles, fetchRoles } = useRoleManagementStore()
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    if (members.status === 'idle') {
      fetchMembers()
    }
    if (roles.status === 'idle') {
      fetchRoles()
    }
  }, [members.status, roles.status, fetchMembers, fetchRoles])

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    setActionInProgress(userId)
    try {
      await changeRole(userId, newRoleId)
      toast.success('Cargo alterado com sucesso')
    } catch (error) {
      toast.error('Erro ao alterar cargo: ' + String(error))
    } finally {
      setActionInProgress(null)
    }
  }

  const handleSuspendMember = async (userId: string) => {
    setActionInProgress(userId)
    try {
      await suspendMember(userId)
      toast.success('Membro suspenso com sucesso')
    } catch (error) {
      toast.error('Erro ao suspender membro: ' + String(error))
    } finally {
      setActionInProgress(null)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro? Esta ação não pode ser desfeita.')) {
      return
    }
    
    setActionInProgress(userId)
    try {
      await removeMember(userId)
      toast.success('Membro removido com sucesso')
    } catch (error) {
      toast.error('Erro ao remover membro: ' + String(error))
    } finally {
      setActionInProgress(null)
    }
  }

  const isAllSelected = members.status === 'success' && 
    members.data.length > 0 && 
    members.data.every(member => selectedMemberIds.has(member.id))

  const selectedCount = selectedMemberIds.size

  if (members.status === 'loading') {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (members.status === 'error') {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-800/50 bg-red-950/50 p-4">
          <div className="flex items-center gap-3">
            <X className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Erro ao carregar equipe</h3>
              <p className="text-sm text-red-300/80">{members.error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-zinc-100">Equipe & RBAC</h1>
            <p className="text-zinc-400">
              Gerencie membros da equipe, convites, cargos e permissões de acesso.
            </p>
          </div>

          <Button 
            onClick={() => setInviteDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Membro
          </Button>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                />
              </div>

              {/* Bulk Actions */}
              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">
                    {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    Limpar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 hover:bg-zinc-800"
                      >
                        Ações em Lote
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-400 focus:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Selecionados
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">
                  Membros da Equipe ({members.status === 'success' ? members.data.length : 0})
                </CardTitle>
                <CardDescription>
                  Gerencie acesso, cargos e permissões dos membros da organização.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50 hover:bg-zinc-800/30">
                    <TableHead className="w-[50px] pl-4">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAll()
                          } else {
                            clearSelection()
                          }
                        }}
                        className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                    </TableHead>
                    <TableHead className="text-zinc-300">Membro</TableHead>
                    <TableHead className="text-zinc-300">Cargo</TableHead>
                    <TableHead className="text-zinc-300">Status</TableHead>
                    <TableHead className="text-zinc-300">Último Login</TableHead>
                    <TableHead className="text-zinc-300">MFA</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.status === 'success' && members.data.map((member) => (
                    <TableRow 
                      key={member.id} 
                      className="border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedMemberIds.has(member.id)}
                          onCheckedChange={() => toggleSelection(member.id)}
                          className="border-zinc-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-zinc-700/50">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-zinc-200">{member.name}</div>
                            <div className="text-sm text-zinc-500">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getRoleBadge(member.role.name, member.role.level)}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(member.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-zinc-400">
                          {member.lastLoginAt ? (
                            member.lastLoginAt.toLocaleDateString('pt-BR')
                          ) : (
                            'Nunca'
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {member.mfaEnabled ? (
                          <Badge variant="outline" className="text-xs border-emerald-700/50 text-emerald-400 bg-emerald-950/50">
                            <Shield className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-zinc-700/50 text-zinc-500 bg-zinc-950/50">
                            <ShieldX className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-zinc-800"
                              disabled={actionInProgress === member.id}
                            >
                              <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {roles.status === 'success' && (
                              <>
                                <div className="px-2 py-1.5">
                                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                    Alterar Cargo
                                  </p>
                                </div>
                                {roles.data.map((role) => (
                                  <DropdownMenuItem
                                    key={role.id}
                                    onClick={() => handleRoleChange(member.id, role.id)}
                                    disabled={role.id === member.role.id}
                                    className={cn(
                                      role.id === member.role.id && "bg-zinc-800/50 text-zinc-500"
                                    )}
                                  >
                                    {role.id === member.role.id && <Check className="h-4 w-4 mr-2" />}
                                    {role.id !== member.role.id && <div className="h-4 w-4 mr-2" />}
                                    {role.name}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                              </>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleSuspendMember(member.id)}
                              className="text-yellow-400 focus:text-yellow-400"
                              disabled={member.status === 'suspended'}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-400 focus:text-red-400"
                              disabled={member.role.level === 'owner'}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {members.status === 'success' && members.data.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">Nenhum membro encontrado</h3>
                <p className="text-zinc-500 mb-4">
                  Comece convidando membros para sua organização.
                </p>
                <Button 
                  onClick={() => setInviteDialogOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Primeiro Membro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite Member Dialog */}
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
        />
      </div>
    </div>
  )
}