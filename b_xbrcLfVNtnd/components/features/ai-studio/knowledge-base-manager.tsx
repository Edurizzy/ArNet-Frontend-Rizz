'use client'

import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useKnowledgeBaseStore } from '@/stores/ai-studio-store'
import { getRagDocuments } from '@/services/ai-studio-api'
import { KnowledgeDocumentRow } from './knowledge-document-row'
import { 
  Database, 
  Upload, 
  FileText, 
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

function KnowledgeBaseSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  )
}

export function KnowledgeBaseManager() {
  const { 
    documents, 
    isLoading, 
    isUploading,
    uploadProgress,
    setDocuments, 
    setLoading,
    setUploading,
    setUploadProgress,
  } = useKnowledgeBaseStore()

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      try {
        const data = await getRagDocuments()
        setDocuments(data)
      } finally {
        setLoading(false)
      }
    }
    loadDocuments()
  }, [setDocuments, setLoading])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Simulate upload process
    setUploading(true)
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress((prev: number) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [setUploading, setUploadProgress])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Stats
  const readyDocs = documents.filter(d => d.status === 'ready').length
  const processingDocs = documents.filter(d => ['uploading', 'chunking', 'embedding', 'indexing'].includes(d.status)).length
  const failedDocs = documents.filter(d => d.status === 'failed').length
  const totalChunks = documents.reduce((acc, d) => acc + d.chunkCount, 0)

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100">Base de Conhecimento</h2>
              <p className="text-xs text-zinc-500">Pipeline de Ingestão RAG</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 h-8"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Reindexar Tudo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Documentos</p>
            <p className="mt-1 text-xl font-semibold font-mono text-zinc-100">{documents.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Indexados</p>
            <p className="mt-1 text-xl font-semibold font-mono text-emerald-400">{readyDocs}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Processando</p>
            <p className="mt-1 text-xl font-semibold font-mono text-amber-400">{processingDocs}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Total Chunks</p>
            <p className="mt-1 text-xl font-semibold font-mono text-zinc-100">{totalChunks.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <Input
              placeholder="Buscar documentos..."
              className="h-8 bg-zinc-900 border-zinc-800 pl-9 text-sm placeholder:text-zinc-600"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 h-8"
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filtros
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Upload Zone */}
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              "rounded-xl border-2 border-dashed p-8 text-center transition-all",
              isUploading 
                ? "border-emerald-500/50 bg-emerald-500/5" 
                : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
            )}
          >
            {isUploading ? (
              <div className="space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Upload className="h-6 w-6 animate-pulse" />
                </div>
                <p className="text-sm font-medium text-emerald-400">Processando documentos...</p>
                <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                <p className="text-xs text-zinc-500 font-mono">{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-500">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-400">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Suporta PDF, TXT, Markdown
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Selecionar Arquivos
                </Button>
              </>
            )}
          </div>

          {/* Document List */}
          {isLoading ? (
            <KnowledgeBaseSkeleton />
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <KnowledgeDocumentRow key={doc.id} document={doc} />
              ))}
            </div>
          )}

          {/* Failed Documents Alert */}
          {failedDocs > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm font-medium text-red-400">
                {failedDocs} documento{failedDocs > 1 ? 's' : ''} com falha no processamento
              </p>
              <p className="mt-1 text-xs text-red-400/70">
                Verifique os documentos marcados como falha e tente reprocessar
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
