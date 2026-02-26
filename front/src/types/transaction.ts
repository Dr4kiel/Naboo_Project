import type { Category } from './category'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: number
  amount: string
  type: TransactionType
  description?: string
  date: string
  category?: Category
  created_at: string
}

export interface StoreTransactionRequest {
  category_id?: number
  amount: number
  type: TransactionType
  description?: string
  date: string
}

export interface UpdateTransactionRequest {
  category_id?: number
  amount?: number
  type?: TransactionType
  description?: string
  date?: string
}
