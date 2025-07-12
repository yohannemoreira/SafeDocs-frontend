export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Document {
  id: string
  name: string
  type: 'PDF' | 'Word' | 'Excel' | 'PowerPoint' | 'Image' | 'Other'
  size: string
  uploadDate: string
  sharedWith: number
  isShared: boolean
  tags?: string[]
  description?: string
  owner: string
  lastAccessed?: string
  securityLevel: 'low' | 'medium' | 'high'
}

export interface UploadProgress {
  id: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  size: string
  type: string
}

export interface DashboardStats {
  totalDocuments: number
  sharedDocuments: number
  storageUsed: string
  storageTotal: string
  recentActivity: number
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    avatar: '/avatars/joao.jpg',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@exemplo.com',
    avatar: '/avatars/maria.jpg',
    role: 'user',
    createdAt: '2024-02-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@exemplo.com',
    role: 'user',
    createdAt: '2024-03-10T09:15:00Z'
  }
]

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Contrato_Servicos_2024.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadDate: '2024-01-15',
    sharedWith: 3,
    isShared: true,
    tags: ['contrato', 'importante', '2024'],
    description: 'Contrato de prestação de serviços para o ano de 2024',
    owner: 'João Silva',
    lastAccessed: '2024-07-05',
    securityLevel: 'high'
  },
  {
    id: '2',
    name: 'Apresentacao_Projeto.pptx',
    type: 'PowerPoint',
    size: '8.7 MB',
    uploadDate: '2024-02-10',
    sharedWith: 5,
    isShared: true,
    tags: ['apresentação', 'projeto'],
    description: 'Apresentação do projeto para stakeholders',
    owner: 'Maria Santos',
    lastAccessed: '2024-07-03',
    securityLevel: 'medium'
  },
  {
    id: '3',
    name: 'Relatorio_Financeiro_Q1.xlsx',
    type: 'Excel',
    size: '1.2 MB',
    uploadDate: '2024-03-01',
    sharedWith: 2,
    isShared: true,
    tags: ['financeiro', 'relatório', 'Q1'],
    description: 'Relatório financeiro do primeiro trimestre',
    owner: 'Pedro Costa',
    lastAccessed: '2024-07-01',
    securityLevel: 'high'
  },
  {
    id: '4',
    name: 'Manual_Usuario.docx',
    type: 'Word',
    size: '3.8 MB',
    uploadDate: '2024-03-15',
    sharedWith: 0,
    isShared: false,
    tags: ['manual', 'documentação'],
    description: 'Manual do usuário do sistema',
    owner: 'João Silva',
    lastAccessed: '2024-06-28',
    securityLevel: 'low'
  },
  {
    id: '5',
    name: 'Logo_Empresa.png',
    type: 'Image',
    size: '512 KB',
    uploadDate: '2024-04-01',
    sharedWith: 8,
    isShared: true,
    tags: ['logo', 'branding'],
    description: 'Logo oficial da empresa',
    owner: 'Maria Santos',
    lastAccessed: '2024-07-07',
    securityLevel: 'low'
  },
  {
    id: '6',
    name: 'Backup_Database.sql',
    type: 'Other',
    size: '45.2 MB',
    uploadDate: '2024-04-20',
    sharedWith: 1,
    isShared: true,
    tags: ['backup', 'database', 'crítico'],
    description: 'Backup completo do banco de dados',
    owner: 'Pedro Costa',
    lastAccessed: '2024-07-06',
    securityLevel: 'high'
  }
]

// Mock Upload Progress
export const mockUploadProgress: UploadProgress[] = [
  {
    id: 'upload-1',
    fileName: 'documento_novo.pdf',
    progress: 75,
    status: 'uploading',
    size: '3.2 MB',
    type: 'application/pdf'
  },
  {
    id: 'upload-2',
    fileName: 'imagem_teste.jpg',
    progress: 100,
    status: 'completed',
    size: '1.8 MB',
    type: 'image/jpeg'
  },
  {
    id: 'upload-3',
    fileName: 'planilha_dados.xlsx',
    progress: 0,
    status: 'error',
    size: '2.5 MB',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
]

// Mock Dashboard Statistics
export const mockDashboardStats: DashboardStats = {
  totalDocuments: 24,
  sharedDocuments: 12,
  storageUsed: '156.8 MB',
  storageTotal: '1 GB',
  recentActivity: 8
}

// Authentication helpers
export const mockAuthUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  avatar: '/avatars/joao.jpg',
  role: 'admin',
  createdAt: '2024-01-15T10:00:00Z'
}

// Mock API Functions
export const mockApi = {
  // Login function
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = mockUsers.find(u => u.email === email)
    if (user && password === 'password123') {
      return { success: true, user }
    }
    return { success: false, error: 'Credenciais inválidas' }
  },

  // Register function
  register: async (userData: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: 'Senhas não coincidem' }
    }

    if (mockUsers.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email já está em uso' }
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    mockUsers.push(newUser)
    return { success: true, user: newUser }
  },

  // Upload function
  uploadFile: async (file: File, onProgress?: (progress: number) => void): Promise<{ success: boolean; document?: Document; error?: string }> => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      onProgress?.(i)
    }

    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: getFileType(file.type),
      size: formatFileSize(file.size),
      uploadDate: new Date().toISOString().split('T')[0],
      sharedWith: 0,
      isShared: false,
      owner: mockAuthUser.name,
      securityLevel: 'medium'
    }

    mockDocuments.unshift(newDocument)
    return { success: true, document: newDocument }
  },

  // Get documents
  getDocuments: async (): Promise<Document[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockDocuments
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockDashboardStats
  }
}

// Helper functions
function getFileType(mimeType: string): Document['type'] {
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PowerPoint'
  if (mimeType.includes('image')) return 'Image'
  return 'Other'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Form validation helpers
export const validationRules = {
  email: (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },
  password: (password: string) => {
    return password.length >= 6
  },
  name: (name: string) => {
    return name.trim().length >= 2
  }
}
