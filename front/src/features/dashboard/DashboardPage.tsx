import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { api } from '@/lib/api'
import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import TransactionForm from '@/features/transactions/TransactionForm'
import TransactionCard from '@/features/transactions/TransactionCard'

function formatAmount(amount: string | number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(amount))
}

function getCurrentMonthBounds() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  }
}

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { year, month } = getCurrentMonthBounds()

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get<Transaction[]>('/api/transactions'),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/categories'),
  })

  const monthlyTransactions = (transactions ?? []).filter((t) => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() === month
  })

  const income = monthlyTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = monthlyTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  const recent = [...(transactions ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]))

  const categoryTotals = monthlyTransactions.reduce<Record<number, number>>((acc, t) => {
    if (t.category) {
      acc[t.category.id] = (acc[t.category.id] ?? 0) + Number(t.amount)
    }
    return acc
  }, {})

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Balance card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Solde du mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(balance)}
            </p>
          )}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>{txLoading ? '…' : formatAmount(income)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span>{txLoading ? '…' : formatAmount(expense)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick add */}
      <Button className="w-full" onClick={() => setAddOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nouvelle transaction
      </Button>

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(categoryTotals).map(([id, total]) => {
              const cat = categoryMap.get(Number(id))
              if (!cat) return null
              return (
                <Badge
                  key={id}
                  style={{ backgroundColor: cat.color ?? undefined }}
                  className="text-white"
                >
                  {cat.name} · {formatAmount(total)}
                </Badge>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent transactions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Dernières transactions</h2>
        {txLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
        ) : (
          <div className="space-y-2">
            {recent.map((t) => (
              <TransactionCard key={t.id} transaction={t} readonly />
            ))}
          </div>
        )}
      </div>

      <TransactionForm open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
