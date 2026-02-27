import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import type { RecurringTransaction } from '@/types/recurring-transaction'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import RecurringTransactionCard from './RecurringTransactionCard'
import RecurringTransactionForm from './RecurringTransactionForm'

export default function RecurringTransactionsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringTransaction | undefined>()

  const { data: items, isLoading } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: () => api.get<RecurringTransaction[]>('/api/recurring-transactions'),
  })

  const handleAdd = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const handleEdit = (rt: RecurringTransaction) => {
    setEditing(rt)
    setFormOpen(true)
  }

  const active = (items ?? []).filter((rt) => rt.is_active)
  const inactive = (items ?? []).filter((rt) => !rt.is_active)

  const totalMonthly = active.reduce((sum, rt) => {
    const amount = Number(rt.amount)
    return sum + (rt.type === 'expense' ? -amount : amount)
  }, 0)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Prélèvements récurrents</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Bilan mensuel :{' '}
              <span
                className={
                  totalMonthly >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                }
              >
                {totalMonthly >= 0 ? '+' : ''}
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                  totalMonthly,
                )}
              </span>
            </p>
          )}
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (items ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Aucun prélèvement récurrent.</p>
          <p className="text-xs mt-1">Ajoutez vos abonnements et charges fixes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Actifs ({active.length})
              </h2>
              {active.map((rt) => (
                <RecurringTransactionCard
                  key={rt.id}
                  recurringTransaction={rt}
                  onEdit={() => handleEdit(rt)}
                />
              ))}
            </section>
          )}
          {inactive.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Suspendus ({inactive.length})
              </h2>
              {inactive.map((rt) => (
                <RecurringTransactionCard
                  key={rt.id}
                  recurringTransaction={rt}
                  onEdit={() => handleEdit(rt)}
                />
              ))}
            </section>
          )}
        </div>
      )}

      <RecurringTransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        recurringTransaction={editing}
      />
    </div>
  )
}
