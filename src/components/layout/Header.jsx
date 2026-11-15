import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Sparkles, X, Zap } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getCreditBalance } from '../../lib/billingApi.js'
import ThemeToggle from '../ui/ThemeToggle'

const DEFAULT_STYLES_PATH = '/styles/1980s-vintage-portrait'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [creditBalance, setCreditBalance] = useState(null)
  const [creditLoading, setCreditLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isStylesRoute = location.pathname.startsWith('/styles/')
  const stylesNavTarget = isStylesRoute ? location.pathname : DEFAULT_STYLES_PATH

  // Listen for credit balance update events from other components
  useEffect(() => {
    const handleCreditBalanceUpdated = async () => {
      if (!user) return
      try {
        const balance = await getCreditBalance()
        setCreditBalance(balance)
      } catch (error) {
        console.error('Failed to refresh credit balance:', error)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('creditBalanceUpdated', handleCreditBalanceUpdated)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('creditBalanceUpdated', handleCreditBalanceUpdated)
      }
    }
  }, [user])

  const navItems = [
    { label: 'Home', to: '/', end: true },
    { label: 'Explore', to: '/explore' },
    { label: 'Styles', to: stylesNavTarget },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Create', to: '/create' },
    ...(user ? [{ label: 'My Prompts', to: '/my-prompts' }, { label: 'Favorites', to: '/favorites' }] : []),
    { label: 'Voice Prompt', to: '/voice-prompt' },
    { label: 'AI Enhancer', to: '/ai-enhancer', icon: Sparkles },
  ]

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    toast.success('Logout successful.')
    setCreditBalance(null)
    setCreditLoading(false)
  }

  const handleCreditClick = () => {
    navigate('/billing')
    closeMenu()
  }

  // Handle initial credit fetch after user authentication
  useEffect(() => {
    if (!user) return

    let isMounted = true

    const loadCreditBalance = async () => {
      try {
        setCreditLoading(true)
        const balance = await getCreditBalance()
        if (isMounted) {
          setCreditBalance(balance)
          setCreditLoading(false)
        }
      } catch (error) {
        console.error('Failed to load credit balance:', error)
        if (isMounted) {
          setCreditLoading(false)
        }
      }
    }

    loadCreditBalance()

    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/70 relative">
      <div className="mx-auto flex min-h-16 w-[min(var(--container-width),calc(100%-2rem))] items-center justify-between gap-1 md:gap-2">
        <NavLink
          to="/"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-transparent px-1.5 py-1 text-sm font-bold tracking-[-0.04em] text-[var(--text)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          aria-label="PromptMuse home"
          onClick={closeMenu}
        >
          <span className="inline-flex size-8 items-center justify-center rounded-[0.7rem] border border-[var(--border)] bg-[var(--brand-soft)] text-sm font-bold text-[var(--text)] shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            P
          </span>
          <span className="hidden sm:inline">PromptMuse</span>
        </NavLink>

        <nav
          className="hidden flex-1 items-center justify-center gap-0.5 text-xs sm:gap-1.5 sm:text-sm md:flex md:gap-2 lg:gap-2.5"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const resolvedIsActive = item.label === 'Styles' ? isStylesRoute : undefined

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative inline-flex min-h-9 items-center whitespace-nowrap px-0.5 py-2 text-sm font-medium transition-colors sm:px-1 md:text-sm ${
                    (resolvedIsActive ?? isActive)
                      ? 'text-[var(--text)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[var(--brand)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`
                }
              >
                <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                  {item.icon ? <item.icon className="size-4 flex-shrink-0" aria-hidden="true" /> : null}
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center justify-end gap-0.5 md:gap-1">
          <ThemeToggle />

          {user ? (
            <div className="hidden items-center gap-0.5 md:flex">
              {/* Credit Balance Display */}
              <button
                type="button"
                onClick={handleCreditClick}
                disabled={creditLoading}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1.5 text-xs sm:text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--brand-soft)] disabled:opacity-60 disabled:cursor-not-allowed"
                title="Click to view billing dashboard"
              >
                <Zap className="size-4 flex-shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <span>
                  {creditLoading ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading
                    </span>
                  ) : creditBalance !== null ? (
                    creditBalance.availableCredits
                  ) : (
                    '0'
                  )}
                </span>
              </button>

              {/* Billing Link */}
              <NavLink
                to="/billing"
                className={({ isActive }) =>
                  `inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]'
                  }`
                }
              >
                Billing
              </NavLink>

              <span className="hidden text-xs sm:text-sm font-medium text-[var(--text-muted)] lg:inline whitespace-nowrap">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs sm:text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-0.5 md:flex">
              <NavLink
                to="/pricing"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs sm:text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]"
              >
                Pricing
              </NavLink>
              <NavLink
                to="/login"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs sm:text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs sm:text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Sign up
              </NavLink>
            </div>
          )}

          <button
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-colors hover:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] md:hidden"
          >
            {isMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-x-0 top-full border-t border-[var(--border)] bg-[var(--background)]/95 shadow-[0_16px_36px_rgba(15,23,42,0.08)] md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              aria-label="Mobile navigation"
              className="mx-auto flex w-[min(var(--container-width),calc(100%-2rem))] flex-col py-3"
            >
              {navItems.map((item, index) => {
                const resolvedIsActive = item.label === 'Styles' ? isStylesRoute : undefined

                return (
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
                          (resolvedIsActive ?? isActive)
                            ? 'bg-[var(--surface-elevated)] text-[var(--text)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        {item.icon ? <item.icon className="size-4" aria-hidden="true" /> : null}
                        {item.label}
                      </span>
                      <span aria-hidden="true">•</span>
                    </NavLink>
                  </motion.div>
                )
              })}

              {user ? (
                <>
                  {/* Credit Balance in Mobile Menu */}
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length) * 0.04, duration: 0.18, ease: 'easeOut' }}
                    onClick={handleCreditClick}
                    disabled={creditLoading}
                    className="mt-2 flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5 text-base font-medium text-[var(--text)] transition-colors hover:border-[var(--focus)] hover:bg-[var(--brand-soft)] disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Zap className="size-4 text-[var(--brand)]" aria-hidden="true" />
                      {creditLoading ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading
                        </span>
                      ) : creditBalance !== null ? (
                        creditBalance.availableCredits
                      ) : (
                        '0'
                      )} Credits
                    </span>
                    <span aria-hidden="true">•</span>
                  </motion.button>

                  {/* Billing Link in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.04, duration: 0.18, ease: 'easeOut' }}
                  >
                    <NavLink
                      to="/billing"
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-full px-3 py-2.5 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-[var(--surface-elevated)] text-[var(--text)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`
                      }
                    >
                      <span>Billing</span>
                      <span aria-hidden="true">•</span>
                    </NavLink>
                  </motion.div>

                  
                  {/* Usage History Link in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 3) * 0.04, duration: 0.18, ease: 'easeOut' }}
                  >
                    <NavLink
                      to="/history"
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-full px-3 py-2.5 text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-[var(--surface-elevated)] text-[var(--text)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`
                      }
                    >
                      <span>Usage History</span>
                      <span aria-hidden="true">•</span>
                    </NavLink>
                  </motion.div>

{/* User Name Display in Mobile Menu */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 2) * 0.04, duration: 0.18, ease: 'easeOut' }}
                    className="flex items-center justify-between rounded-full px-3 py-2.5 text-base font-medium text-[var(--text-muted)]"
                  >
                    <span className="truncate">{user.name}</span>
                    <span aria-hidden="true">•</span>
                  </motion.div>

                  
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 4) * 0.04, duration: 0.18, ease: 'easeOut' }}
                    onClick={handleLogout}
                    className="mt-2 flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base font-medium text-[var(--text)] transition-colors hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]"
                  >
                    <span>Logout</span>
                    <span aria-hidden="true">•</span>
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Pricing Link for Unauthenticated Users */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.04, duration: 0.18, ease: 'easeOut' }}
                  >
                    <NavLink
                      to="/pricing"
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base font-medium text-[var(--text)] transition-colors hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]"
                    >
                      <span>Pricing</span>
                      <span aria-hidden="true">•</span>
                    </NavLink>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.04, duration: 0.18, ease: 'easeOut' }}
                  >
                    <NavLink
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base font-medium text-[var(--text)] transition-colors hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]"
                    >
                      <span>Login</span>
                      <span aria-hidden="true">•</span>
                    </NavLink>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 2) * 0.04, duration: 0.18, ease: 'easeOut' }}
                  >
                    <NavLink
                      to="/signup"
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base font-medium text-[var(--text)] transition-colors hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]"
                    >
                      <span>Sign up</span>
                      <span aria-hidden="true">•</span>
                    </NavLink>
                  </motion.div>
                </>
              )}
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default Header
