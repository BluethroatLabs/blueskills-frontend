import { cn } from 'cn'
import { useTheme } from 'next-themes'

export const ThemeControl = () => {
  const { theme: activeTheme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="grid min-h-11 grid-cols-3 border border-(--rule-2)"
    >
      {(['system', 'light', 'dark'] as const).map((theme, index) => (
        <button
          key={theme}
          type="button"
          aria-pressed={activeTheme === theme}
          onClick={() => setTheme(theme)}
          className={cn(
            'theme-choice min-w-17 px-2.5 py-1.5 text-sm capitalize transition-colors hover:bg-(--panel-2)',
            index < 2 && 'border-r border-(--rule)',
            activeTheme === theme &&
              'bg-(--fill-bg) text-(--fill-text) hover:bg-(--fill-bg)'
          )}
        >
          {theme}
        </button>
      ))}
    </div>
  )
}
