import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { label: 'Home', to: '/', end: true },
  { label: 'Explore', to: '/explore' },
  { label: 'Styles', to: '/styles/1980s-vintage-portrait' },
  { label: 'Create', to: '/create' },
]

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/70">
      <div className="mx-auto flex min-h-[72px] w-[min(var(--container-width),calc(100%-2rem))] items-center justify-between gap-2 md:gap-4">
        <NavLink
          to="/"
          className="inline-flex shrink-0 items-center gap-3 rounded-full border border-transparent px-2 py-1.5 text-sm font-bold tracking-[-0.04em] text-[var(--text)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          aria-label="PromptMuse home"
          onClick={closeMenu}
        >
          <span className="inline-flex size-8 items-center justify-center rounded-[0.7rem] border border-[var(--border)] bg-[var(--brand-soft)] text-sm font-bold text-[var(--text)] shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            P
          </span>
          <span>PromptMuse</span>
        </NavLink>

        <nav
          className="hidden flex-1 items-center justify-center gap-2 text-[11px] sm:gap-3 sm:text-sm md:flex md:gap-5"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative inline-flex min-h-9 items-center px-1.5 py-2 font-medium transition-colors sm:px-2 ${
                  isActive
                    ? 'text-[var(--text)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[var(--brand)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-colors hover:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] md:hidden"
          >
            {isMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="border-t border-[var(--border)] bg-[var(--background)]/95 md:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              aria-label="Mobile navigation"
              className="mx-auto flex w-[min(var(--container-width),calc(100%-2rem))] flex-col py-3"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.18, ease: 'easeOut' }}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-full px-3 py-2.5 text-base font-medium transition-colors ${
                        isActive ? 'bg-[var(--surface-elevated)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true">•</span>
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default Header
