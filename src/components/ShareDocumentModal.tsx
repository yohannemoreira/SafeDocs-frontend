"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "../components/ui/dialog"
import { 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  Eye, 
  AlertCircle, 
  Link as LinkIcon,
  RefreshCw 
} from "lucide-react"

interface DocumentType {
  id: number
  originalName: string
  fileType: string
  fileSize: number
  uploadDate: string
}

interface SharedLink {
  id: number
  token: string
  expiresAt: string
  accessCount: number
  createdAt: string
}

interface ShareDocumentModalProps {
  document: DocumentType | null
  isOpen: boolean
  onClose: () => void
}

export default function ShareDocumentModal({ document, isOpen, onClose }: ShareDocumentModalProps) {
  const [sharedLink, setSharedLink] = useState<SharedLink | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateShareLink = async () => {
    if (!document) return

    try {
      setIsGenerating(true)
      setError(null)

      const token = localStorage.getItem('AuthToken')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shared-links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: document.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao gerar link de compartilhamento')
      }

      const linkData: SharedLink = await response.json()
      setSharedLink(linkData)

    } catch (error) {
      console.error('Erro ao gerar link:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!sharedLink) return

    const shareUrl = `${window.location.origin}/shared/${sharedLink.token}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
      // Fallback para browsers mais antigos
      if (typeof window !== 'undefined' && window.document) {
        const textArea = window.document.createElement('textarea')
        textArea.value = shareUrl
        window.document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          window.document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (fallbackError) {
          console.error('Fallback copy failed:', fallbackError)
        }
        window.document.body.removeChild(textArea)
      }
    }
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt: string): boolean => {
    return new Date() > new Date(expiresAt)
  }

  const getDaysUntilExpiration = (expiresAt: string): number => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleClose = () => {
    setSharedLink(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  if (!document) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Documento
          </DialogTitle>
          <DialogDescription>
            Gere um link seguro para compartilhar "{document.originalName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!sharedLink ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <LinkIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    Crie um link temporário para compartilhar este documento com outras pessoas.
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Link expira em 7 dias</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Acesso rastreado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Link de Compartilhamento</CardTitle>
                <CardDescription>
                  Link criado com sucesso! Copie e compartilhe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="share-url">URL de Compartilhamento</Label>
                  <div className="flex gap-2">
                    <Input
                      id="share-url"
                      value={`${window.location.origin}/shared/${sharedLink.token}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button 
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-600">Link copiado!</p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status:</span>
                    <Badge variant={isExpired(sharedLink.expiresAt) ? "destructive" : "default"}>
                      {isExpired(sharedLink.expiresAt) ? "Expirado" : "Ativo"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Expira em:</span>
                    <span>{formatDate(sharedLink.expiresAt)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Dias restantes:</span>
                    <span className="font-medium">
                      {Math.max(0, getDaysUntilExpiration(sharedLink.expiresAt))} dias
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Acessos:</span>
                    <span className="font-medium">{sharedLink.accessCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            {!sharedLink ? (
              <>
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={generateShareLink} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Gerar Link
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} className="flex-1">
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
