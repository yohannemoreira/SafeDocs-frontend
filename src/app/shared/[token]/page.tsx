"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Download, 
  FileText, 
  ImageIcon, 
  File, 
  Clock, 
  Eye, 
  AlertCircle, 
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react"

interface SharedDocument {
  downloadUrl: string
  document?: {
    originalName: string
    fileType: string
    fileSize: number
  }
}

export default function SharedLinkPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sharedDocument, setSharedDocument] = useState<SharedDocument | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-12 w-12 text-slate-400" />
    
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-12 w-12 text-green-500" />
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-12 w-12 text-red-500" />
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-12 w-12 text-blue-500" />
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-12 w-12 text-green-600" />
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="h-12 w-12 text-orange-500" />
    } else {
      return <File className="h-12 w-12 text-slate-500" />
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "Tamanho desconhecido"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeLabel = (fileType?: string): string => {
    if (!fileType) return 'Documento'
    if (fileType.startsWith('image/')) return 'Imagem'
    if (fileType === 'application/pdf') return 'PDF'
    if (fileType.includes('word') || fileType.includes('document')) return 'Word'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint'
    if (fileType === 'text/plain') return 'Texto'
    return 'Documento'
  }

  const fetchSharedDocument = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shared-links/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Link de compartilhamento não encontrado ou inválido.')
        } else if (response.status === 410) {
          throw new Error('Este link de compartilhamento expirou.')
        } else {
          throw new Error('Erro ao acessar o documento compartilhado.')
        }
      }

      const data: SharedDocument = await response.json()
      setSharedDocument(data)

    } catch (error) {
      console.error('Erro ao buscar documento compartilhado:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!sharedDocument?.downloadUrl) return

    try {
      setIsDownloading(true)
      
      // Criar um link temporário para download
      const link = document.createElement('a')
      link.href = sharedDocument.downloadUrl
      link.download = sharedDocument.document?.originalName || 'documento'
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Erro no download:', error)
      alert('Erro ao baixar o arquivo. Tente novamente.')
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchSharedDocument()
    } else {
      setError('Token inválido')
      setIsLoading(false)
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Verificando link de compartilhamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">SafeDocs</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Documento Compartilhado
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {error ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    Acesso Negado
                  </h2>
                  <p className="text-slate-600 mb-4">{error}</p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <p>• Verifique se o link está correto</p>
                    <p>• O link pode ter expirado</p>
                    <p>• Entre em contato com quem compartilhou</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="mt-4"
                >
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : sharedDocument ? (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getFileIcon(sharedDocument.document?.fileType)}
              </div>
              <CardTitle className="text-xl">
                {sharedDocument.document?.originalName || 'Documento Compartilhado'}
              </CardTitle>
              <CardDescription>
                Este documento foi compartilhado com você de forma segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações de Segurança */}
              <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Link Seguro</span>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Link temporário</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3" />
                    <span>Acesso rastreado</span>
                  </div>
                </div>
              </div>

              {/* Botão de Download */}
              <div className="text-center">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  size="lg"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Documento
                    </>
                  )}
                </Button>
              </div>

              {/* Aviso */}
              <div className="text-center text-xs text-slate-500 space-y-1">
                <p>Ao baixar este documento, você concorda em usá-lo responsavelmente.</p>
                <p>Este link é temporário e pode expirar a qualquer momento.</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
