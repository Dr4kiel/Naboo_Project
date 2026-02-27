import { Pencil, Trash2, Pause, Play } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { RecurringTransaction } from '@/types/recurring-transaction'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  recurringTransaction: RecurringTransaction
  onEdit?: () => void
}

function formatAmount(amount: string | number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
    Number(amount),
  )
}

function formatDayOfMonth(day: number) {
  return `Le ${day} du mois`
}

export default function RecurringTransactionCard({ recurringTransaction: rt, onEdit }: Props) {
  const qc = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/recurring-transactions/${rt.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-transactions'] })
      toast.success('Prélèvement supprimé')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  const toggleMutation = useMutation({
    mutationFn: () =>
      api.put(`/api/recurring-transactions/${rt.id}`, { is_active: !rt.is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-transactions'] })
      toast.success(rt.is_active ? 'Prélèvement suspendu' : 'Prélèvement activé')
    },
    onError: () => toast.error('Une erreur est survenue'),
  })

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border bg-card p-3', !rt.is_active && 'opacity-60')}>
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          backgroundColor: rt.category?.color ?? (rt.type === 'income' ? '#22c55e20' : '#ef444420'),
        }}
      >
        {rt.category?.icon ?? (rt.type === 'income' ? '↑' : '↓')}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {rt.description ?? (rt.type === 'income' ? 'Revenu' : 'Dépense')}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatDayOfMonth(rt.day_of_month)}</span>
          {rt.category && (
            <Badge
              variant="secondary"
              className="text-xs py-0"
              style={{ backgroundColor: rt.category.color ? `${rt.category.color}30` : undefined }}
            >
              {rt.category.name}
            </Badge>
          )}
          {!rt.is_active && (
            <Badge variant="secondary" className="text-xs py-0">
              Suspendu
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span
          className={cn(
            'font-semibold text-sm',
            rt.type === 'income' ? 'text-green-600' : 'text-red-600',
          )}
        >
          {rt.type === 'income' ? '+' : '-'}
          {formatAmount(rt.amount)}
        </span>
        <div className="flex ml-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
          >
            {rt.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
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
      </div>
    </div>
  )
}
