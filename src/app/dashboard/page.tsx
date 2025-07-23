"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Shield,
  Upload,
  Search,
  Filter,
  FileText,
  ImageIcon,
  File,
  Share2,
  Download,
  Trash2,
  MoreVertical,
  Plus,
  Bell,
  Settings,
  LogOut,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import ShareDocumentModal from "@/components/ShareDocumentModal"

// Interfaces para tipagem dos dados reais
interface Document {
  id: number
  originalName: string
  fileType: string
  fileSize: number
  uploadDate: string
  s3Key: string
  s3Bucket: string
  filename: string
}

interface Stats {
  totalDocuments: number
  totalStorage: string
  sharedDocuments: number
  recentUploads: number
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    totalStorage: "0 MB",
    sharedDocuments: 0,
    recentUploads: 0,
  });
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [documentToShare, setDocumentToShare] = useState<Document | null>(null);

  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Função para buscar documentos do backend
  const fetchDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      setError(null);

      const token = localStorage.getItem('AuthToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout(); // Token expirado
          return;
        }
        throw new Error('Erro ao carregar documentos');
      }

      const documentsData: Document[] = await response.json();
      setDocuments(documentsData);

      // Calcular estatísticas
      const totalSize = documentsData.reduce((acc, doc) => acc + doc.fileSize, 0);
      const recentUploads = documentsData.filter(doc => {
        const uploadDate = new Date(doc.uploadDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return uploadDate > weekAgo;
      }).length;

      setStats({
        totalDocuments: documentsData.length,
        totalStorage: formatFileSize(totalSize),
        sharedDocuments: 0, // Implementar quando tiver funcionalidade de compartilhamento
        recentUploads: recentUploads,
      });

    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Função para deletar documento
  const deleteDocument = async (documentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('AuthToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir documento');
      }

      // Atualizar lista de documentos
      await fetchDocuments();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert('Erro ao excluir documento. Tente novamente.');
    }
  };

  // Função para abrir modal de compartilhamento
  const openShareModal = (document: Document) => {
    setDocumentToShare(document);
    setShareModalOpen(true);
  };

  // Função para fechar modal de compartilhamento
  const closeShareModal = () => {
    setShareModalOpen(false);
    setDocumentToShare(null);
  };

  const handleLogout = () => {
    logout()
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Buscar documentos quando o usuário estiver logado
  useEffect(() => {
    if (user && !isLoading) {
      fetchDocuments();
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-green-500" />
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-500" />
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-5 w-5 text-green-600" />
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="h-5 w-5 text-orange-500" />
    } else {
      return <File className="h-5 w-5 text-slate-500" />
    }
  }

  const getFileTypeLabel = (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'Imagem'
    if (fileType === 'application/pdf') return 'PDF'
    if (fileType.includes('word') || fileType.includes('document')) return 'Word'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint'
    if (fileType === 'text/plain') return 'Texto'
    return 'Documento'
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const filteredDocuments = documents.filter((doc) => 
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getShareLink = async (documentId: number): Promise<string | null> => {
  const token = localStorage.getItem('AuthToken');
  if (!token) return null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shared-links`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ documentId })
  });

  if (!response.ok) return null;
  const linkData = await response.json();
  return `${window.location.origin}/shared/${linkData.token}`;
};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800">SafeDocs</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                    <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && <p className="font-medium">{user.name}</p>}
                    {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento Usado</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStorage}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos Compartilhados</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sharedDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uploads Recentes</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentUploads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Meus Documentos</CardTitle>
                <CardDescription>Gerencie e organize seus documentos</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchDocuments}
                  disabled={isLoadingDocuments}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingDocuments ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Link href="/upload">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2">Carregando documentos...</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  {searchTerm ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm 
                    ? 'Tente ajustar sua pesquisa ou limpar o filtro.'
                    : 'Comece fazendo upload do seu primeiro documento.'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/upload">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Fazer Upload
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      {getFileIcon(doc.fileType)}
                      <div>
                        <h3 className="font-medium">{doc.originalName}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploadDate)}</span>
                          <span>•</span>
                          <span>{getFileTypeLabel(doc.fileType)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                          onClick={async () => {
                              const link = await getShareLink(doc.id);
                              if (link) {
                                window.open(link, "_blank"); // Abre o link para download
                              } else {
                                alert("Erro ao gerar link de download.");
                              }
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openShareModal(doc)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Compartilhamento */}
        <ShareDocumentModal
          document={documentToShare}
          isOpen={shareModalOpen}
          onClose={closeShareModal}
        />
      </div>
    </div>
  )
}
