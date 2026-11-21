import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'

function Footer() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.footer
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="border-t border-[var(--border)] bg-[var(--surface)]/95"
    >
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 md:py-12">
        <div className="grid gap-8 border-b border-[var(--border)] pb-8 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-6 md:pb-8">
          {/* Brand Section */}
          <div className="max-w-sm">
            <p className="m-0 text-lg font-bold tracking-[-0.05em] text-[var(--text)]">PromptTouch AI</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Discover image styles, copy ready-to-use prompts, and create your next image with AI-powered prompt enhancement.
            </p>
          </div>

          {/* Explore Section */}
          <nav aria-label="Footer explore navigation" className="min-w-0">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Explore
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <Link
                to="/"
                className="inline-flex items-center rounded-md px-1 py-1 transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Home
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center rounded-md px-1 py-1 transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Explore Prompts
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center rounded-md px-1 py-1 transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Explore Styles
              </Link>
            </div>
          </nav>

          {/* Features Section */}
          <nav aria-label="Footer features navigation" className="min-w-0">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Features
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <Link
                to="/voice-prompt"
                className="inline-flex items-center rounded-md px-1 py-1 transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Voice Prompt
              </Link>
              <Link
                to="/ai-enhancer"
                className="inline-flex items-center rounded-md px-1 py-1 transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                AI Enhancer
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center rounded-md px-1 py-1 transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Pricing
              </Link>
            </div>
          </nav>

          {/* Creator Section */}
          <div className="min-w-0">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              About
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Built with care by <span className="text-[var(--text)]">Rafsan Jany Ratul</span>
            </p>
          </div>
        </div>

        <div className="pt-6 text-center md:text-left">
          <p className="m-0 text-[11px] leading-5 text-[var(--text-muted)]">
            © 2026 Rafsan Jany Ratul. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
