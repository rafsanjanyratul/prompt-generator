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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      {isDark ? <MoonStar className="size-5" /> : <SunMedium className="size-5" />}
    </button>
  )
}

export default ThemeToggle
