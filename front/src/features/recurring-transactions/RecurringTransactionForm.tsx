import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { RecurringTransaction } from '@/types/recurring-transaction'
import type { Category } from '@/types/category'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  amount: z.coerce.number().positive('Montant invalide'),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  day_of_month: z.coerce.number().int().min(1, 'Jour invalide').max(28, 'Jour invalide'),
  category_id: z.coerce.number().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  recurringTransaction?: RecurringTransaction
}

export default function RecurringTransactionForm({ open, onOpenChange, recurringTransaction }: Props) {
  const qc = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/categories'),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      amount: undefined,
      type: 'expense',
      description: '',
      day_of_month: 1,
      category_id: undefined,
    },
  })

  useEffect(() => {
    if (recurringTransaction) {
      form.reset({
        amount: Number(recurringTransaction.amount),
        type: recurringTransaction.type,
        description: recurringTransaction.description ?? '',
        day_of_month: recurringTransaction.day_of_month,
        category_id: recurringTransaction.category?.id,
      })
    } else {
      form.reset({
        amount: undefined,
        type: 'expense',
        description: '',
        day_of_month: 1,
        category_id: undefined,
      })
    }
  }, [recurringTransaction, open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        ...values,
        category_id: values.category_id || undefined,
      }
      if (recurringTransaction) {
        return api.put<RecurringTransaction>(
          `/api/recurring-transactions/${recurringTransaction.id}`,
          body,
        )
      }
      return api.post<RecurringTransaction>('/api/recurring-transactions', body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-transactions'] })
      toast.success(recurringTransaction ? 'Prélèvement mis à jour' : 'Prélèvement ajouté')
      onOpenChange(false)
    },
    onError: () => toast.error('Une erreur est survenue'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {recurringTransaction ? 'Modifier le prélèvement' : 'Nouveau prélèvement récurrent'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Dépense</SelectItem>
                      <SelectItem value="income">Revenu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day_of_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jour du prélèvement (1–28)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="28" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie (optionnel)</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === 'none' ? undefined : Number(v))}
                    value={field.value?.toString() ?? 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Aucune" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {(categories ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Loyer, Netflix, Salle de sport…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
