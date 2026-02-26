import { Pencil, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Category } from '@/types/category'
import { Button } from '@/components/ui/button'

interface Props {
  category: Category
  onEdit: () => void
}

export default function CategoryCard({ category: c, onEdit }: Props) {
  const qc = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/categories/${c.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Catégorie supprimée')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: c.color ?? '#e5e7eb' }}
      >
        {c.icon ?? '📁'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{c.name}</p>
        {c.color && <p className="text-xs text-muted-foreground">{c.color}</p>}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
