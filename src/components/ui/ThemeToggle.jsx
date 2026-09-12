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
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" aria-hidden="true" />
      </span>
      <span className="theme-toggle__label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}

export default ThemeToggle
