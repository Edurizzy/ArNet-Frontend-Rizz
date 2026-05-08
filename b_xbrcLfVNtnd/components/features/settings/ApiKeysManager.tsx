'use client'

import { useEffect, useState } from 'react'
import { Key, Plus, Eye, EyeOff, RotateCw, Trash2, Copy, Calendar } from 'lucide-react'
import { useApiKeysStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'

export function ApiKeysManager() {
  const { 
    apiKeys, 
    fetchApiKeys, 
    revokeApiKey, 
    rotateApiKey,
    revealedKeys,
    toggleKeyRevealed 
  } = useApiKeysStore()

  useEffect(() => {
    if (apiKeys.status === 'idle') {
      fetchApiKeys()
    }
  }, [apiKeys.status, fetchApiKeys])

  const handleCopyKey = (keyPreview: string) => {
    // In real app, this would copy the full key from secure storage
    navigator.clipboard.writeText(`sk-${keyPreview.replace('...', 'xxxxxxxxx')}`)
    toast.success('Chave copiada para área de transferência')
  }

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Tem certeza que deseja revogar a chave "${keyName}"? Esta ação não pode ser desfeita.`)) {
      return
    }
    
    try {
      await revokeApiKey(keyId)
      toast.success('Chave de API revogada com sucesso')
    } catch (error) {
      toast.error('Erro ao revogar chave: ' + String(error))
    }
  }

  if (apiKeys.status === 'loading') {
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-zinc-100">Chaves de API</h1>
            <p className="text-zinc-400">
              Gerencie chaves de autenticação para integrações e automações.
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Chave API
          </Button>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-400" />
              Suas Chaves de API
            </CardTitle>
            <CardDescription>
              Gerencie acesso programático à plataforma ArNet.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/50">
                  <TableHead className="text-zinc-300">Nome</TableHead>
                  <TableHead className="text-zinc-300">Chave</TableHead>
                  <TableHead className="text-zinc-300">Ambiente</TableHead>
                  <TableHead className="text-zinc-300">Status</TableHead>
                  <TableHead className="text-zinc-300">Último Uso</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.status === 'success' && apiKeys.data.map((key) => (
                  <TableRow key={key.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                    <TableCell>
                      <div>
                        <div className="font-medium text-zinc-200">{key.name}</div>
                        {key.description && (
                          <div className="text-sm text-zinc-500">{key.description}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-zinc-800/50 px-2 py-1 rounded font-mono text-zinc-300">
                          {revealedKeys.has(key.id) ? `sk-••••${key.keyPreview}` : key.keyPreview}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyRevealed(key.id)}
                          className="h-6 w-6 p-0"
                        >
                          {revealedKeys.has(key.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key.keyPreview)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          key.environment === 'production' 
                            ? "border-red-700/50 text-red-400 bg-red-950/50"
                            : key.environment === 'staging'
                            ? "border-yellow-700/50 text-yellow-400 bg-yellow-950/50"
                            : "border-blue-700/50 text-blue-400 bg-blue-950/50"
                        }
                      >
                        {key.environment === 'production' ? 'Produção' : 
                         key.environment === 'staging' ? 'Teste' : 'Desenvolvimento'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          key.status === 'active'
                            ? "border-emerald-700/50 text-emerald-400 bg-emerald-950/50"
                            : "border-red-700/50 text-red-400 bg-red-950/50"
                        }
                      >
                        {key.status === 'active' ? 'Ativo' : 'Revogado'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-zinc-400 text-sm">
                      {key.lastUsedAt ? key.lastUsedAt.toLocaleDateString('pt-BR') : 'Nunca'}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-zinc-800"
                          disabled={key.status !== 'active'}
                        >
                          <RotateCw className="h-4 w-4 text-zinc-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeKey(key.id, key.name)}
                          className="h-8 w-8 p-0 hover:bg-red-950/50"
                          disabled={key.status !== 'active'}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {apiKeys.status === 'success' && apiKeys.data.length === 0 && (
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">Nenhuma chave de API</h3>
                <p className="text-zinc-500 mb-4">
                  Crie sua primeira chave para integrar com a API da ArNet.
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Chave
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}