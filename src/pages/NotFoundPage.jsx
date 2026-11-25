import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

function NotFoundPage() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const goHome = () => navigate('/')
  const goExplore = () => navigate('/explore')

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-12 bg-[var(--background)] text-[var(--text)]">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-0 text-center max-w-2xl"
      >
        {/* Subtle decorative glow behind the 404 typography */}
        <div
          className="absolute top-[-8%] left-[-6%] w-64 h-64 rounded-full bg-[var(--brand-accent)] opacity-12 blur-[96px] -z-10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-8%] right-[-6%] w-64 h-64 rounded-full bg-[var(--brand-accent)] opacity-12 blur-[96px] -z-10 pointer-events-none"
          aria-hidden="true"
        />

        <span className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] shadow-sm">
          PAGE NOT FOUND
        </span>
        <h1 className="mt-6 mb-3 text-6xl md:text-9xl font-black tracking-tighter text-[var(--text)]">
          404
        </h1>
        <h2 className="mt-2 mb-6 text-xl md:text-2xl font-semibold tracking-tight text-[var(--text)]">
          Looks like you&rsquo;ve wandered off the canvas.
        </h2>
        <p className="mb-10 text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={goHome}>
            Back to Home
          </Button>
          <Button variant="dark" size="lg" onClick={goExplore}>
            Explore Styles
          </Button>
        </div>
        <p className="mt-12 text-[11px] md:text-sm text-[var(--text-muted)]">
          A little detour in your creative journey.
        </p>
      </motion.div>
    </section>
  )
}

export default NotFoundPage