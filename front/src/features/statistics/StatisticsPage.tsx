import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import type { Transaction } from '@/types/transaction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const MONTH_NAMES = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Aoû',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
]

const CATEGORY_COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
]

function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatAmountShort(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function StatisticsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get<Transaction[]>('/api/transactions'),
  })

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

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  // 1. 6 derniers mois — données pour BarChart
  const monthlyData = useMemo(() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      let m = month - i
      let y = year
      while (m < 0) {
        m += 12
        y--
      }
      const txs = (transactions ?? []).filter((t) => {
        const d = new Date(t.date)
        return d.getFullYear() === y && d.getMonth() === m
      })
      const income = txs
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0)
      const expense = txs
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0)
      result.push({ name: MONTH_NAMES[m], income, expense })
    }
    return result
  }, [transactions, year, month])

  // 2. Répartition des dépenses par catégorie (mois sélectionné)
  const categoryData = useMemo(() => {
    const monthTxs = (transactions ?? []).filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month && t.type === 'expense'
    })

    const totals: Record<number, { name: string; value: number; color: string }> = {}
    let uncategorized = 0

    monthTxs.forEach((t) => {
      if (t.category) {
        if (!totals[t.category.id]) {
          totals[t.category.id] = {
            name: t.category.name,
            value: 0,
            color:
              t.category.color ??
              CATEGORY_COLORS[Object.keys(totals).length % CATEGORY_COLORS.length],
          }
        }
        totals[t.category.id].value += Number(t.amount)
      } else {
        uncategorized += Number(t.amount)
      }
    })

    const items = Object.values(totals).sort((a, b) => b.value - a.value)
    if (uncategorized > 0) {
      items.push({ name: 'Sans catégorie', value: uncategorized, color: '#94a3b8' })
    }
    return items
  }, [transactions, year, month])

  // 3. Évolution journalière (mois sélectionné)
  const dailyData = useMemo(() => {
    const monthTxs = (transactions ?? []).filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })

    const days: Record<number, { income: number; expense: number }> = {}
    monthTxs.forEach((t) => {
      const day = new Date(t.date).getDate()
      if (!days[day]) days[day] = { income: 0, expense: 0 }
      if (t.type === 'income') days[day].income += Number(t.amount)
      else days[day].expense += Number(t.amount)
    })

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: days[i + 1]?.income ?? 0,
      expense: days[i + 1]?.expense ?? 0,
    }))
  }, [transactions, year, month])

  // Totaux du mois sélectionné
  const monthTotals = useMemo(() => {
    const txs = (transactions ?? []).filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
    const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = txs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0)
    return { income, expense, balance: income - expense }
  }, [transactions, year, month])

  const hasMonthData = (transactions ?? []).some((t) => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() === month
  })

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Sélecteur de mois */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-semibold capitalize">
          {new Date(year, month).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isCurrentMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Cartes récapitulatives */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="pt-4 pb-3 px-3">
              <p className="text-xs text-muted-foreground mb-1">Revenus</p>
              <p className="text-sm font-bold text-green-600 tabular-nums">
                {formatAmount(monthTotals.income)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-3">
              <p className="text-xs text-muted-foreground mb-1">Dépenses</p>
              <p className="text-sm font-bold text-red-600 tabular-nums">
                {formatAmount(monthTotals.expense)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-3">
              <p className="text-xs text-muted-foreground mb-1">Solde</p>
              <p
                className={`text-sm font-bold tabular-nums ${monthTotals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatAmount(monthTotals.balance)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphique en barres — 6 derniers mois */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Aperçu des 6 derniers mois</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => formatAmountShort(v)}
                  width={55}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value != null ? formatAmount(value) : ''
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => (value === 'income' ? 'Revenus' : 'Dépenses')}
                />
                <Bar dataKey="income" fill="#16a34a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Graphique donut — dépenses par catégorie */}
      {!isLoading && categoryData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        value != null ? formatAmount(value) : ''
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 w-full sm:w-1/2">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-muted-foreground flex-1">{cat.name}</span>
                    <span className="font-medium tabular-nums flex-shrink-0">
                      {formatAmount(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphique en aires — évolution journalière */}
      {!isLoading && dailyData.some((d) => d.income > 0 || d.expense > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Évolution journalière</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => formatAmountShort(v)}
                  width={55}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value != null ? formatAmount(value) : ''
                  }
                  labelFormatter={(label: unknown) => `Jour ${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => (value === 'income' ? 'Revenus' : 'Dépenses')}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#gradIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="url(#gradExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {!isLoading && !hasMonthData && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Aucune transaction pour ce mois.
        </p>
      )}
    </div>
  )
}
