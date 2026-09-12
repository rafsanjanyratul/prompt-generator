import { NavLink } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Styles', to: '/styles/featured' },
]

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/70">
      <div className="mx-auto flex min-h-[76px] w-[min(var(--container-width),calc(100%-2rem))] items-center justify-between gap-3 md:gap-4">
        <NavLink
          to="/"
          className="inline-flex items-center gap-3 rounded-full border border-transparent px-2 py-1.5 text-sm font-bold tracking-[-0.04em] text-[var(--text)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          aria-label="PromptMuse home"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-[0.7rem] border border-[var(--border)] bg-[var(--brand-soft)] text-sm font-bold text-[var(--text)] shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            P
          </span>
          <span>PromptMuse</span>
        </NavLink>

        <nav
          className="hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 p-1 shadow-[0_10px_28px_rgba(15,23,42,0.04)] md:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex min-h-9 items-center rounded-full px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--surface-elevated)] text-[var(--text)] shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
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
