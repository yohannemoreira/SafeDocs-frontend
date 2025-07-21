"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, Upload, FileText, ImageIcon, File, X, Check, ArrowLeft, Cloud } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface UploadFile {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  metadata?: {
    type: string
    size: string
    lastModified: string
  }
}

interface UploadSettings {
  description: string
  extractMetadata: boolean
  virusScan: boolean
  autoCategorize: boolean
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [settings, setSettings] = useState<UploadSettings>({
    description: "",
    extractMetadata: true,
    virusScan: true,
    autoCategorize: false
  })

  const { user } = useAuth()
  const router = useRouter()

  
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-green-500" />
    } else if (type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />
    } else {
      return <File className="h-8 w-8 text-blue-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }


  const handleFiles = (fileList: FileList) => {
    const maxFileSize = 50 * 1024 * 1024 // 50MB (limite do S3 para upload direto)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ]

    const newFiles: UploadFile[] = Array.from(fileList)
      .filter(file => {
        if (file.size > maxFileSize) {
          alert(`Arquivo ${file.name} é muito grande. Máximo permitido: 50MB`)
          return false
        }
        if (!allowedTypes.includes(file.type)) {
          alert(`Tipo de arquivo ${file.type} não permitido`)
          return false
        }
        return true
      })
      .map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: "pending",
        metadata: {
          type: file.type,
          size: formatFileSize(file.size),
          lastModified: new Date(file.lastModified).toLocaleDateString(),
        },
      }))

    setFiles((prev) => [...prev, ...newFiles])
  }



  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
  try {
    const token = localStorage.getItem("AuthToken");

    if (!token) {
      throw new Error("Usuário não autenticado")
    }

    setFiles((prev) => prev.map((file) =>
      file.id === uploadFile.id ? { ...file, status: "uploading", progress: 10 } : file
    ))

    console.log('📤 Solicitando URL pré-assinada para:', uploadFile.file.name)

    // Enviar apenas os campos que o backend espera
    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalName: uploadFile.file.name,
        fileType: uploadFile.file.type,
        fileSize: uploadFile.file.size
        // Removido: description e outras configurações que não estão no DTO
      })
    })

    console.log('📡 Response status:', uploadResponse.status)

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      console.log('❌ Error data:', errorData)
      throw new Error(errorData.message || 'Erro ao solicitar URL de upload')
    }

    const { signedUrl } = await uploadResponse.json()
    console.log('🔗 URL pré-assinada recebida')

    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, progress: 30 }
        : f
    ))

    console.log('📤 Fazendo upload para S3...')
    
    const s3Response = await fetch(signedUrl, {
      method: 'PUT',
      body: uploadFile.file,
      headers: {
        'Content-Type': uploadFile.file.type
      }
    })

    console.log('📡 S3 Response status:', s3Response.status)

    if (!s3Response.ok) {
      throw new Error(`Erro no upload para o S3: ${s3Response.status}`)
    }

    console.log('✅ Upload para S3 concluído')

    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: "completed", progress: 100 }
        : f
    ))

  } catch (error) {
    console.error('❌ Erro no upload:', error)
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { 
            ...f, 
            status: "error", 
            errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
          }
        : f
    ))
  }
}

  const uploadFiles = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    const pendingFiles = files.filter(f => f.status === "pending")
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    // Upload sequencial para evitar muitas requisições simultâneas
    for (const file of pendingFiles) {
      await uploadSingleFile(file)
    }

    setIsUploading(false)
    console.log('Uploads concluídos')
  }

  const handleSettingChange = (key: keyof UploadSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">Upload de Documentos</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Enviar Documentos
            </CardTitle>
            <CardDescription>Arraste e solte seus arquivos ou clique para selecionar</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Solte seus arquivos aqui</h3>
              <p className="text-slate-500 mb-4">Suporte para PDF, imagens, documentos do Office e mais</p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              />
              <Label htmlFor="file-upload" className="container flex items-center justify-center cursor-pointer">
                <Button asChild>
                  <span>Selecionar Arquivos</span>
                </Button>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Arquivos Selecionados</CardTitle>
                  <CardDescription>{files.length} arquivo(s) prontos para upload</CardDescription>
                </div>
                <Button
                  onClick={uploadFiles}
                  disabled={files.some((f) => f.status === "uploading")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadFile.file.type)}
                        <div>
                          <h4 className="font-medium">{uploadFile.file.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{uploadFile.metadata?.size}</span>
                            <span>•</span>
                            <span>{uploadFile.metadata?.lastModified}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {uploadFile.status === "completed" && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                        {uploadFile.status === "uploading" && <Badge variant="secondary">Enviando...</Badge>}
                        {uploadFile.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => removeFile(uploadFile.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="h-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Upload</CardTitle>
            <CardDescription>Configure as opções de processamento dos seus documentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Adicione uma descrição para este lote de documentos..."
                rows={3}
                value={settings.description}
                onChange={(e) => handleSettingChange('description', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="extract-metadata" defaultChecked />
              <Label htmlFor="extract-metadata">Extrair metadados automaticamente (recomendado)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="virus-scan" defaultChecked />
              <Label htmlFor="virus-scan">Verificar arquivos por vírus</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-categorize" />
              <Label htmlFor="auto-categorize">Categorizar automaticamente por tipo</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
