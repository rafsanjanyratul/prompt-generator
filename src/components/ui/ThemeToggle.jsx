import { useEffect, useState } from 'react'

const STORAGE_KEY = 'promptmuse-theme'

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const storedValue = localStorage.getItem(STORAGE_KEY)

    if (storedValue) {
      return storedValue
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[11px] font-semibold text-[var(--text)]"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="relative inline-flex h-6 w-10 items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)]">
        <span
          className={`absolute left-1 h-4 w-4 rounded-full bg-[var(--brand)] transition-transform duration-200 ${
            theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
          }`}
          aria-hidden="true"
        />
      </span>
      <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}

export default ThemeToggle
