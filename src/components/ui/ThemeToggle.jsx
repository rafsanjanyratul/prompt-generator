import { MoonStar, SunMedium } from 'lucide-react'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'promptmuse-theme'

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (storedValue === 'light' || storedValue === 'dark') {
      return storedValue
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text)] shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      <span className="relative inline-flex h-6 w-10 items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] p-1">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--background)] transition-transform duration-200 ${
            isDark ? 'translate-x-4' : 'translate-x-0'
          }`}
          aria-hidden="true"
        >
          {isDark ? <MoonStar className="size-2.5" /> : <SunMedium className="size-2.5" />}
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        {isDark ? <MoonStar className="size-3.5" /> : <SunMedium className="size-3.5" />}
        <span>{isDark ? 'Dark' : 'Light'}</span>
      </span>
    </button>
  )
}

export default ThemeToggle
