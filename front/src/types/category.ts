export interface Category {
  id: number
  name: string
  color?: string
  icon?: string
  created_at: string
}

export interface StoreCategoryRequest {
  name: string
  color?: string
  icon?: string
}

export interface UpdateCategoryRequest {
  name?: string
  color?: string
  icon?: string
}
