"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    name: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('safedocs-user')
    const token = localStorage.getItem('AuthToken')
    if (savedUser && token) {
      try {
        const userData = JSON.parse(savedUser) as User
        setUser(userData)
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error)
        localStorage.removeItem('safedocs-user')
        localStorage.removeItem('AuthToken')
      }
    }
    setIsLoading(false)
  }, [])


  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "email": email,
        "password": password
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      });

      const data = await response.json();

      if (response.ok){
        localStorage.setItem('AuthToken', data.accessToken);
        localStorage.setItem('safedocs-user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };

    } finally {
      setIsLoading(false)
    }
  }

const register = async (userData: {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}) => {
  setIsLoading(true)
  try {
    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: 'As senhas não coincidem' }
    }

    // Remove confirmPassword antes de enviar
    const { confirmPassword, acceptTerms, ...registerData } = userData

    console.log('📤 Dados sendo enviados para o backend:', registerData)
    console.log('🔗 URL:', `${API_BASE_URL}/auth/register`)

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })

    console.log('📡 Status da resposta:', response.status)
    
    const data = await response.json()
    console.log('📦 Resposta do backend:', data)

    if (response.ok) {
      // Fazer login automático após registro
      const loginResult = await login(registerData.email, registerData.password)
      return loginResult
    } else {
      return { 
        success: false, 
        error: data.message || 'Erro ao criar conta' 
      }
    }
  } catch (error) {
    console.error('❌ Erro no registro:', error)
    return { 
      success: false, 
      error: 'Erro de conexão. Verifique sua internet.' 
    }
  } finally {
    setIsLoading(false)
  }
}

  const logout = () => {
    setUser(null)
    localStorage.removeItem('safedocs-user')
    localStorage.removeItem('AuthToken')
    router.push('/login')
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
