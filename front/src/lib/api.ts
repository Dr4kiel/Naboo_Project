import type { ApiError } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

class ApiException extends Error {
  errors?: Record<string, string[]>

  constructor(data: ApiError) {
    super(data.message)
    this.errors = data.errors
  }
}

function getToken(): string | null {
  return localStorage.getItem('naboo_token')
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const data: ApiError = await response.json().catch(() => ({ message: response.statusText }))
    throw new ApiException(data)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  del: <T = void>(path: string) => request<T>('DELETE', path),
}

export { ApiException }
