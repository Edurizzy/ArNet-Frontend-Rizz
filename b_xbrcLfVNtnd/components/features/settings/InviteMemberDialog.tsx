'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Mail, Shield, X } from 'lucide-react'
import { useTeamMembersStore, useRoleManagementStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const { inviteMember } = useTeamMembersStore()
  const { roles, fetchRoles } = useRoleManagementStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    roleId: '',
    message: '',
  })

  useEffect(() => {
    if (open && roles.status === 'idle') {
      fetchRoles()
    }
  }, [open, roles.status, fetchRoles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.roleId) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      await inviteMember(formData)
      toast.success('Convite enviado com sucesso')
      setFormData({ email: '', roleId: '', message: '' })
      onOpenChange(false)
    } catch (error) {
      toast.error(String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ email: '', roleId: '', message: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-400" />
            Convidar Novo Membro
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Envie um convite para um novo membro se juntar à sua organização.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 bg-zinc-800/50 border-zinc-700 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-zinc-200">
              Cargo *
            </Label>
            <Select 
              value={formData.roleId} 
              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
            >
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-zinc-500" />
                  <SelectValue placeholder="Selecione um cargo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {roles.status === 'success' && roles.data.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.name}</span>
                      {role.description && (
                        <span className="text-xs text-zinc-500">- {role.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-zinc-200">
              Mensagem Personalizada (Opcional)
            </Label>
            <Textarea
              id="message"
              placeholder="Adicione uma mensagem de boas-vindas..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-zinc-800/50 border-zinc-700 focus:border-emerald-500 min-h-[80px]"
              rows={3}
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.email || !formData.roleId}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}