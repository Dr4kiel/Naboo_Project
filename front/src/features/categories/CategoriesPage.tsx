import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import type { Category } from '@/types/category'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CategoryCard from './CategoryCard'
import CategoryForm from './CategoryForm'

export default function CategoriesPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | undefined>()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/categories'),
  })

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Catégories</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (categories ?? []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-4">Aucune catégorie pour l'instant</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Créer une catégorie
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(categories ?? []).map((c) => (
            <CategoryCard key={c.id} category={c} onEdit={() => setEditCat(c)} />
          ))}
        </div>
      )}

      <CategoryForm open={addOpen} onOpenChange={setAddOpen} />
      <CategoryForm
        open={!!editCat}
        onOpenChange={(v) => { if (!v) setEditCat(undefined) }}
        category={editCat}
      />
    </div>
  )
}
