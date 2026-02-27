import type { Category } from './category'

export type TransactionType = 'income' | 'expense'

export interface RecurringTransaction {
  id: number
  amount: string
  type: TransactionType
  description?: string
  day_of_month: number
  is_active: boolean
  category?: Category
  created_at: string
}

export interface StoreRecurringTransactionRequest {
  category_id?: number
  amount: number
  type: TransactionType
  description?: string
  day_of_month: number
  is_active?: boolean
}

export interface UpdateRecurringTransactionRequest {
  category_id?: number
  amount?: number
  type?: TransactionType
  description?: string
  day_of_month?: number
  is_active?: boolean
}
