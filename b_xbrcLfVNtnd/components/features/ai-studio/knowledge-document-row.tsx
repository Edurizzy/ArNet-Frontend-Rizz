'use client'

import { cn } from '@/lib/utils'
import type { RagDocument, DocumentPipelineStatus, VectorHealthStatus } from '@/types/ai-studio'
import { 
  FileText, 
  FileJson, 
  File,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<DocumentPipelineStatus, {
  label: string
  color: string
  bgColor: string
  icon: typeof Clock
  animate: boolean
}> = {
  uploading: {
    label: 'Enviando',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    icon: Loader2,
    animate: true,
  },
  chunking: {
    label: 'Chunking',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    icon: Loader2,
    animate: true,
  },
  embedding: {
    label: 'Embedding',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    icon: Loader2,
    animate: true,
  },
  indexing: {
    label: 'Indexando',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    icon: Loader2,
    animate: true,
  },
  ready: {
    label: 'Indexado',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    icon: CheckCircle2,
    animate: false,
  },
  failed: {
    label: 'Falha',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    icon: AlertCircle,
    animate: false,
  },
}

const vectorHealthConfig: Record<VectorHealthStatus, {
  label: string
  color: string
}> = {
  optimal: { label: 'Optimal', color: 'text-emerald-400' },
  degraded: { label: 'Degraded', color: 'text-amber-400' },
  stale: { label: 'Stale', color: 'text-orange-400' },
  missing: { label: 'Missing', color: 'text-zinc-500' },
}

const fileTypeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  txt: File,
  md: FileJson,
  docx: FileText,
}

interface KnowledgeDocumentRowProps {
  document: RagDocument
}

export function KnowledgeDocumentRow({ document }: KnowledgeDocumentRowProps) {
  const status = statusConfig[document.status]
  const vectorHealth = vectorHealthConfig[document.vectorHealth]
  const Icon = fileTypeIcons[document.fileType] || File
  const StatusIcon = status.icon

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const isProcessing = ['uploading', 'chunking', 'embedding', 'indexing'].includes(document.status)

  return (
    <div className={cn(
      "group flex items-center gap-4 rounded-lg border p-4 transition-all",
      document.status === 'failed' 
        ? "border-red-500/30 bg-red-500/5" 
        : "border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50"
    )}>
      {/* File Icon */}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        document.status === 'ready' 
          ? "bg-emerald-500/10 text-emerald-400" 
          : document.status === 'failed'
            ? "bg-red-500/10 text-red-400"
            : "bg-zinc-800/50 text-zinc-500"
      )}>
        <Icon className="h-5 w-5" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-zinc-200 truncate">
            {document.filename}
          </h4>
          <Badge 
            variant="outline" 
            className={cn("border text-xs font-mono", status.bgColor, status.color)}
          >
            <StatusIcon className={cn("mr-1 h-3 w-3", status.animate && "animate-spin")} />
            {status.label}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
          <span className="font-mono">{formatFileSize(document.fileSizeBytes)}</span>
          <span>|</span>
          <span>{formatDate(document.uploadedAt)}</span>
          {document.metadata.pageCount && (
            <>
              <span>|</span>
              <span>{document.metadata.pageCount} páginas</span>
            </>
          )}
        </div>
        {document.errorMessage && (
          <p className="mt-1 text-xs text-red-400">{document.errorMessage}</p>
        )}
      </div>

      {/* Progress / Chunks */}
      {isProcessing ? (
        <div className="w-32">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-500">Progresso</span>
            <span className="font-mono text-zinc-400">{document.embeddingProgress}%</span>
          </div>
          <Progress value={document.embeddingProgress} className="h-1.5" />
        </div>
      ) : document.status === 'ready' ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-zinc-500">Chunks</p>
            <p className="font-mono text-sm font-medium text-zinc-300">{document.chunkCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Vector</p>
            <p className={cn("font-mono text-sm font-medium", vectorHealth.color)}>
              {vectorHealth.label}
            </p>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
          <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
            <Database className="mr-2 h-4 w-4" />
            Ver Chunks
          </DropdownMenuItem>
          <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reindexar
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400">
            <Trash2 className="mr-2 h-4 w-4" />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
