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
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-6 md:py-8">
        <div className="grid gap-5 border-b border-[var(--border)] pb-5 md:grid-cols-[1.5fr_0.8fr_0.7fr] md:gap-6 md:pb-6">
          <div className="max-w-sm">
            <p className="m-0 text-lg font-bold tracking-[-0.05em] text-[var(--text)]">PromptMuse</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Discover image styles, copy ready-to-use prompts, and create your next image.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="min-w-0">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Navigate
            </p>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--text-muted)]">
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
                Explore
              </Link>
              <Link
                to="/styles/1980s-vintage-portrait"
                className="inline-flex items-center rounded-md px-1 py-1 transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Styles
              </Link>
            </div>
          </nav>

          <div className="min-w-0 text-left md:text-left">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Created by
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Rafsan Jany Ratul</p>
          </div>
        </div>

        <div className="pt-3 text-center md:text-left">
          <p className="m-0 text-[11px] leading-5 text-[var(--text-muted)]">
            © 2026 Rafsan Jany Ratul. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
