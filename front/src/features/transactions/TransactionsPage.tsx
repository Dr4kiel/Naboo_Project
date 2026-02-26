import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import type { Transaction, TransactionType } from '@/types/transaction'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import TransactionCard from './TransactionCard'
import TransactionForm from './TransactionForm'

function getMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(year, month))
}

export default function TransactionsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | undefined>()

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get<Transaction[]>('/api/transactions'),
  })

  const filtered = (transactions ?? [])
    .filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .filter((t) => typeFilter === 'all' || t.type === typeFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          ‹
        </Button>
        <span className="text-sm font-medium capitalize">{getMonthLabel(year, month)}</span>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          ›
        </Button>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="expense">Dépenses</SelectItem>
            <SelectItem value="income">Revenus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Aucune transaction pour cette période</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              onEdit={() => setEditTx(t)}
            />
          ))}
        </div>
      )}

      <TransactionForm open={addOpen} onOpenChange={setAddOpen} />
      <TransactionForm
        open={!!editTx}
        onOpenChange={(v) => { if (!v) setEditTx(undefined) }}
        transaction={editTx}
      />
    </div>
  )
}
