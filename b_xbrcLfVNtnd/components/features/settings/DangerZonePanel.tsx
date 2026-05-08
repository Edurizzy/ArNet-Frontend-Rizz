'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2, Key, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export function DangerZonePanel() {
  const [confirmTexts, setConfirmTexts] = useState({
    deleteOrg: '',
    revokeKeys: '',
    removeSessions: '',
  })

  const handleDeleteOrganization = async () => {
    if (confirmTexts.deleteOrg !== 'DELETAR ORGANIZAÇÃO') {
      toast.error('Texto de confirmação incorreto')
      return
    }

    // In real app, this would call the API
    toast.error('Ação não implementada (apenas demonstração)')
  }

  const handleRevokeAllKeys = async () => {
    if (confirmTexts.revokeKeys !== 'REVOGAR TODAS') {
      toast.error('Texto de confirmação incorreto')
      return
    }

    toast.error('Ação não implementada (apenas demonstração)')
  }

  const handleRemoveAllSessions = async () => {
    if (confirmTexts.removeSessions !== 'REMOVER SESSÕES') {
      toast.error('Texto de confirmação incorreto')
      return
    }

    toast.error('Ação não implementada (apenas demonstração)')
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Zona Perigosa
          </h1>
          <p className="text-zinc-400">
            Ações irreversíveis que podem causar perda permanente de dados. Proceda com extrema cautela.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="border border-red-800/50 bg-red-950/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-1">
                Aviso Importante
              </h3>
              <p className="text-sm text-red-300/80">
                Todas as ações nesta seção são <strong>irreversíveis</strong> e podem resultar em perda permanente de dados, 
                configurações ou acesso à plataforma. Certifique-se de ter backups adequados antes de proceder.
              </p>
            </div>
          </div>
        </div>

        {/* Revoke All API Keys */}
        <Card className="border-red-800/50 bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Revogar Todas as Chaves de API
            </CardTitle>
            <CardDescription className="text-red-300/80">
              Revoga imediatamente todas as chaves de API ativas, interrompendo todas as integrações.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">
                Digite <code className="bg-zinc-800 px-1 py-0.5 rounded text-red-400">REVOGAR TODAS</code> para confirmar
              </Label>
              <Input
                value={confirmTexts.revokeKeys}
                onChange={(e) => setConfirmTexts({ ...confirmTexts, revokeKeys: e.target.value })}
                className="bg-zinc-900/50 border-red-800/50 focus:border-red-600"
                placeholder="Digite o texto de confirmação"
              />
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={confirmTexts.revokeKeys !== 'REVOGAR TODAS'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Revogar Todas as Chaves
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-red-800/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400">Confirmar Revogação</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Isso revogará imediatamente todas as chaves de API ativas. Todas as integrações 
                    pararão de funcionar até que novas chaves sejam criadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-zinc-700 hover:bg-zinc-800">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRevokeAllKeys}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Revogar Todas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Remove All Sessions */}
        <Card className="border-red-800/50 bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Desconectar Todos os Usuários
            </CardTitle>
            <CardDescription className="text-red-300/80">
              Remove todas as sessões ativas de todos os usuários da organização.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">
                Digite <code className="bg-zinc-800 px-1 py-0.5 rounded text-red-400">REMOVER SESSÕES</code> para confirmar
              </Label>
              <Input
                value={confirmTexts.removeSessions}
                onChange={(e) => setConfirmTexts({ ...confirmTexts, removeSessions: e.target.value })}
                className="bg-zinc-900/50 border-red-800/50 focus:border-red-600"
                placeholder="Digite o texto de confirmação"
              />
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={confirmTexts.removeSessions !== 'REMOVER SESSÕES'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Desconectar Todos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-red-800/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400">Confirmar Desconexão</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Isso desconectará imediatamente todos os usuários de todos os dispositivos. 
                    Eles precisarão fazer login novamente para acessar a plataforma.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-zinc-700 hover:bg-zinc-800">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveAllSessions}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Desconectar Todos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Delete Organization */}
        <Card className="border-red-800/50 bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Deletar Organização
            </CardTitle>
            <CardDescription className="text-red-300/80">
              Remove permanentemente a organização e todos os dados associados. Esta ação não pode ser desfeita.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-950/50 border border-red-800/50 rounded-lg">
              <div className="text-sm text-red-300">
                <p className="font-medium mb-2">Esta ação irá:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Deletar permanentemente todos os dados da organização</li>
                  <li>• Remover todos os membros e suas permissões</li>
                  <li>• Cancelar automaticamente o plano ativo</li>
                  <li>• Revogar todas as chaves de API e integrações</li>
                  <li>• Apagar todo o histórico de auditoria</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-zinc-300">
                Digite <code className="bg-zinc-800 px-1 py-0.5 rounded text-red-400">DELETAR ORGANIZAÇÃO</code> para confirmar
              </Label>
              <Input
                value={confirmTexts.deleteOrg}
                onChange={(e) => setConfirmTexts({ ...confirmTexts, deleteOrg: e.target.value })}
                className="bg-zinc-900/50 border-red-800/50 focus:border-red-600"
                placeholder="Digite o texto de confirmação"
              />
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={confirmTexts.deleteOrg !== 'DELETAR ORGANIZAÇÃO'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar Organização Permanentemente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-red-800/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400">Confirmar Exclusão Permanente</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Esta é uma ação irreversível. Todos os dados da organização serão permanentemente 
                    deletados e não poderão ser recuperados. Tem certeza absoluta?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-zinc-700 hover:bg-zinc-800">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteOrganization}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, Deletar Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}