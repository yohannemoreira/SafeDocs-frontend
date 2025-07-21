const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export class ApiClient {
  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken')
    }
    return null
  }

  static async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    // Se token expirou ou inválido, redirecionar para login
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('safedocs-user')
      window.location.href = '/login'
      throw new Error('Token expirado')
    }

    return response
  }

  static async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' })
  }

  static async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  static async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}