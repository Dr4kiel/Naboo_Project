import { Pencil, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Transaction } from '@/types/transaction'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  transaction: Transaction
  readonly?: boolean
  onEdit?: () => void
}

function formatAmount(amount: string | number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    Number(amount),
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export default function TransactionCard({ transaction: t, readonly, onEdit }: Props) {
  const qc = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/transactions/${t.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaction supprimée')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          backgroundColor: t.category?.color ?? (t.type === 'income' ? '#22c55e20' : '#ef444420'),
        }}
      >
        {t.category?.icon ?? (t.type === 'income' ? '↑' : '↓')}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {t.description ?? (t.type === 'income' ? 'Revenu' : 'Dépense')}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
          {t.category && (
            <Badge
              variant="secondary"
              className="text-xs py-0"
              style={{ backgroundColor: t.category.color ? `${t.category.color}30` : undefined }}
            >
              {t.category.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span
          className={cn(
            'font-semibold text-sm',
            t.type === 'income' ? 'text-green-600' : 'text-red-600',
          )}
        >
          {t.type === 'income' ? '+' : '-'}
          {formatAmount(t.amount)}
        </span>
        {!readonly && (
          <div className="flex ml-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
