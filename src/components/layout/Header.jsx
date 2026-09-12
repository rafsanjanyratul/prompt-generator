import { NavLink } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Styles', to: '/styles/featured' },
]

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] w-[min(var(--container-width),calc(100%-2rem))] items-center justify-between gap-4">
        <NavLink
          to="/"
          className="inline-flex items-center gap-3 text-sm font-bold tracking-[-0.04em] text-[var(--text)]"
          aria-label="PromptMuse home"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-[0.7rem] border border-[var(--border)] bg-[var(--brand-soft)] text-sm font-bold text-[var(--text)]">
            P
          </span>
          <span>PromptMuse</span>
        </NavLink>

        <nav className="flex items-center gap-4" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex min-h-9 items-center rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--surface)] text-[var(--text)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
