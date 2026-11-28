import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Menu, Sparkles, X, Zap } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getCreditBalance } from '../../lib/billingApi.js'
import ThemeToggle from '../ui/ThemeToggle'
import Button from '../ui/Button.jsx'

const DEFAULT_STYLES_PATH = '/explore'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
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

  // Close mobile menu when clicking outside the menu or toggle button
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMenuOpen) return
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (toggleRef.current && !toggleRef.current.contains(event.target)) {
          setIsMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/70 relative">
      <div className="mx-auto flex min-h-16 w-[min(var(--container-width),calc(100%-2rem))] items-center justify-between gap-1 md:gap-2 lg:gap-4">
        <NavLink
          to="/"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-transparent px-1.5 py-1 text-sm font-bold tracking-[-0.04em] text-[var(--text)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          aria-label="PromptTouch AI home"
          onClick={closeMenu}
        >
          <img src="/favicon.png" alt="PromptTouch AI" className="size-8 object-contain" />
          <span className="sm:inline">PromptTouch AI</span>
        </NavLink>

        <nav
          className="hidden flex-1 items-center justify-center gap-0.5 text-xs sm:gap-1.5 sm:text-sm lg:flex lg:gap-2.5"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const resolvedIsActive = item.label === 'Styles' ? isStylesRoute : undefined

            return (
              <NavLink
                key={`${item.label}-${item.to}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative inline-flex min-h-9 items-center whitespace-nowrap px-0.5 py-2 text-sm font-medium transition-colors sm:px-1 md:text-sm ${`${
                    (resolvedIsActive ?? isActive)
                      ? 'text-[var(--text)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[var(--brand)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}`
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

        <div className="flex items-center justify-end gap-0.5 md:gap-1 lg:gap-2">
          <ThemeToggle />

          {user ? (
            <div className="hidden items-center gap-0.5 lg:flex">
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
                  `inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 ${`${
                    isActive
                      ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)]'
                  }`}`
                }
              >
                Billing
              </NavLink>

              <span className="hidden text-xs sm:text-sm font-medium text-[var(--text-muted)] lg:inline whitespace-nowrap">{user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-all duration-200 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-0.5 lg:flex">
              <Button asChild variant="primary" size="sm" className="whitespace-nowrap">
                <NavLink to="/login">Login</NavLink>
              </Button>
              <Button asChild variant="primary" size="sm" className="whitespace-nowrap">
                <NavLink to="/signup">Sign up</NavLink>
              </Button>
            </div>
          )}

          <motion.button
            type="button"
            ref={toggleRef}
            whileTap={{ scale: 0.92 }}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-colors hover:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] lg:hidden"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.span key="close" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: 'easeOut' }}>
                  <X className="size-5" aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: 'easeOut' }}>
                  <Menu className="size-5" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        </div>

<AnimatePresence mode="wait">
        {isMenuOpen ? (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
            className="absolute inset-x-0 top-full border-t border-[var(--border)] bg-[var(--background)]/95 shadow-[0_16px_36px_rgba(15,23,42,0.08)] lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <motion.nav
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
              aria-label="Mobile navigation"
              className="mx-auto flex w-[min(var(--container-width),calc(100%-2rem))] flex-col py-3"
            >
              {navItems.map((item, index) => {
                const resolvedIsActive = item.label === 'Styles' ? isStylesRoute : undefined

                return (
                  <motion.div
                    key={`${item.label}-${item.to}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: index * 0.04, duration: 0.2, ease: 'easeOut' }}
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: (navItems.length) * 0.04, duration: 0.2, ease: 'easeOut' }}
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: (navItems.length + 1) * 0.04, duration: 0.2, ease: 'easeOut' }}
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: (navItems.length + 3) * 0.04, duration: 0.2, ease: 'easeOut' }}
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: (navItems.length + 2) * 0.04, duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center justify-between rounded-full px-3 py-2.5 text-base font-medium text-[var(--text-muted)]"
                  >
                    <span className="truncate">{user.name}</span>
                    <span aria-hidden="true">•</span>
                  </motion.div>

                  
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: (navItems.length + 4) * 0.04, duration: 0.2, ease: 'easeOut' }}
                    onClick={handleLogout}
                    className="mt-2 flex items-center justify-between rounded-full bg-[linear-gradient(110deg,#DB2777_0%,#EC4899_50%,#BE185D_100%)] text-white hover:brightness-110 px-3 py-2.5 text-base font-medium"
                  >
                    <span>Logout</span>
                    <span aria-hidden="true">•</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: (navItems.length + 1) * 0.04, duration: 0.2, ease: 'easeOut' }}
                  >
                    <NavLink
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-full bg-[linear-gradient(110deg,#DB2777_0%,#EC4899_50%,#BE185D_100%)] text-white hover:brightness-110 px-3 py-2.5 text-base font-medium w-full"
                    >
                      <span className="!text-white">Login</span>
                      <span className="!text-white" aria-hidden="true">•</span>
                    </NavLink>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ delay: (navItems.length + 2) * 0.04, duration: 0.2, ease: 'easeOut' }}
                  >
                    <NavLink
                      to="/signup"
                      onClick={closeMenu}
                      className="flex items-center justify-between rounded-full bg-[linear-gradient(110deg,#DB2777_0%,#EC4899_50%,#BE185D_100%)] text-white hover:brightness-110 px-3 py-2.5 text-base font-medium w-full"
                    >
                      <span className="!text-white">Sign up</span>
                      <span className="!text-white" aria-hidden="true">•</span>
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
