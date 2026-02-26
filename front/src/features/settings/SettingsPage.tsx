import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const THEMES: { value: Theme; label: string; icon: typeof Sun; description: string }[] = [
  { value: 'light', label: 'Clair', icon: Sun, description: 'Fond blanc' },
  { value: 'dark', label: 'Sombre', icon: Moon, description: 'Fond sombre' },
  { value: 'system', label: 'Système', icon: Monitor, description: "Suit l'OS" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Paramètres</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 py-4 px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  theme === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6',
                    theme === value ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-semibold',
                    theme === value ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground">{description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
