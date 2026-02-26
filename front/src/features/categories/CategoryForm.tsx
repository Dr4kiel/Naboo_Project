import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
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

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
  '#92400e',
]

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  color: z.string().optional(),
  icon: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  category?: Category
}

export default function CategoryForm({ open, onOpenChange, category }: Props) {
  const qc = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: '', icon: '' },
  })

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name, color: category.color ?? '', icon: category.icon ?? '' })
    } else {
      form.reset({ name: '', color: '', icon: '' })
    }
  }, [category, open, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        name: values.name,
        color: values.color || undefined,
        icon: values.icon || undefined,
      }
      if (category) {
        return api.put<Category>(`/api/categories/${category.id}`, body)
      }
      return api.post<Category>('/api/categories', body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success(category ? 'Catégorie mise à jour' : 'Catégorie ajoutée')
      onOpenChange(false)
    },
    onError: () => toast.error('Une erreur est survenue'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alimentation, Transport…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                          borderColor: field.value === color ? 'black' : 'transparent',
                        }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                  <FormControl>
                    <Input placeholder="#3b82f6 (optionnel)" {...field} />
                  </FormControl>
                  {field.value && (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: field.value }}
                      />
                      <span className="text-xs text-muted-foreground">{field.value}</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icône (emoji, optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="🏠 🍕 🚗…" {...field} />
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
