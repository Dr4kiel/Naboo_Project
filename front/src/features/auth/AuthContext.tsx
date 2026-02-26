import { createContext, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'naboo_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    if (!token) return
    api
      .get<{ data: User } | User>('/api/user')
      .then((res) => {
        const u = 'data' in res ? res.data : res
        setUser(u)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
  }, [token])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>('/api/login', data)
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await api.post<AuthResponse>('/api/register', data)
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/logout', {})
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    }
  }, [])

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>
}
