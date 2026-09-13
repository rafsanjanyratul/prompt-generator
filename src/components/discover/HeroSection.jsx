import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { trackEvent } from '../../lib/analytics.js'

const headlineText = 'Find the look. Copy the prompt. Create your next image.'

const ambientShapeConfig = [
  {
    key: 'warm',
    className: 'left-[4%] top-[6%] h-36 w-36 bg-[rgba(245,184,120,0.18)] md:h-56 md:w-56',
    duration: 20,
    delay: 0,
    x: [0, 18, -12, 0],
    y: [0, -10, 12, 0],
  },
  {
    key: 'blue',
    className: 'right-[8%] top-[10%] h-40 w-40 bg-[rgba(148,163,184,0.12)] md:h-60 md:w-60',
    duration: 24,
    delay: 1.2,
    x: [0, -18, 18, 0],
    y: [0, 12, -12, 0],
  },
  {
    key: 'peach',
    className: 'bottom-[10%] left-[28%] h-32 w-32 bg-[rgba(255,214,179,0.12)] md:h-48 md:w-48',
    duration: 22,
    delay: 0.8,
    x: [0, 10, -10, 0],
    y: [0, 16, -8, 0],
  },
]

const moodboardItems = [
  {
    key: 'editorial',
    src: '/images/styles/boys/old-money-luxury-elegance.webp',
    alt: 'Sunlit girl editorial portrait',
    label: 'Editorial portrait',
    className: 'left-2 top-3 w-[48%] -rotate-6 md:left-4 md:top-5',
    delay: 0.1,
  },
  {
    key: 'traditional',
    src: '/images/styles/couples/royalty-heritage-wedding.webp',
    alt: 'Romantic couple wedding scene portrait',
    label: 'traditional',
    className: 'right-2 top-7 w-[54%] rotate-[8deg] md:right-5 md:top-10',
    delay: 0.2,
  },
  {
    key: 'romantic',
    src: '/images/styles/couples/sunset-beach-romance.webp',
    alt: 'romantic sunset in sea beach',
    label: 'romantic beach portrait',
    className: 'bottom-1 left-8 w-[60%] -rotate-[3deg] md:left-14 md:bottom-2',
    delay: 0.3,
  },
]

function HeroSection() {
  const prefersReducedMotion = useReducedMotion()
  const [visibleHeadline, setVisibleHeadline] = useState('')

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleHeadline(headlineText)
      return undefined
    }

    let cancelled = false
    let timeoutId

    const tick = (index = 0, deleting = false) => {
      if (cancelled) {
        return
      }

      const nextText = deleting ? headlineText.slice(0, index) : headlineText.slice(0, index + 1)
      setVisibleHeadline(nextText)

      if (!deleting && index >= headlineText.length) {
        timeoutId = window.setTimeout(() => tick(headlineText.length, true), 1200)
        return
      }

      if (deleting && index <= 0) {
        timeoutId = window.setTimeout(() => tick(0, false), 900)
        return
      }

      timeoutId = window.setTimeout(
        () => tick(index + (deleting ? -1 : 1), deleting),
        deleting ? 70 : 90,
      )
    }

    tick(0, false)

    return () => {
      cancelled = true
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [prefersReducedMotion])

  return (
    <section className="relative overflow-hidden pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16 lg:pt-12">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        initial={prefersReducedMotion ? false : { opacity: 0.75 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(245,185,120,0.18),transparent_46%),radial-gradient(circle_at_bottom_right,_rgba(147,197,253,0.14),transparent_38%)]" />

        {ambientShapeConfig.map((shape) => (
          <motion.div
            key={shape.key}
            aria-hidden="true"
            className={`absolute rounded-full blur-3xl ${shape.className}`}
            animate={prefersReducedMotion ? undefined : { x: shape.x, y: shape.y, scale: [1, 1.06, 1] }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              ease: 'easeInOut',
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'mirror',
            }}
          />
        ))}
      </motion.div>

      <div className="grid items-center gap-8 md:gap-10 md:grid-cols-[1.12fr_0.88fr]">
        <div className="max-w-[40rem] order-1 md:order-none">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Discover the style
          </p>

          <h1
            aria-label={headlineText}
            className="m-0 text-[clamp(2.8rem,6vw,5.1rem)] leading-[0.94] tracking-[-0.07em] text-[var(--text)]"
          >
            <span className="block min-h-[1.2em]">
              {prefersReducedMotion ? headlineText : visibleHeadline}
              {!prefersReducedMotion && visibleHeadline.length < headlineText.length ? (
                <span className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.05em] rounded-full bg-[var(--text)] align-middle opacity-80" />
              ) : null}
            </span>
          </h1>

          <p className="mt-5 max-w-[35rem] text-base leading-7 text-[var(--text-muted)] md:text-lg">
            Browse premium AI photo styles for portraits, couples, family moments, and retro-inspired
            aesthetics. Then use the ready-to-copy prompt to bring the look to life.
          </p>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 18, y: 12 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          className="relative order-2 w-full max-w-[30rem] justify-self-center md:order-none"
        >
          <div className="relative mx-auto h-[300px] w-full max-w-[26rem] overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]/85 p-3 shadow-[0_24px_64px_rgba(15,23,42,0.08)] sm:h-[340px] md:h-[420px] lg:h-[460px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(245,192,128,0.18),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(157,178,255,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_55%)]" />

            <div className="absolute left-5 top-5 hidden h-16 w-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:flex">
              <Star className="size-4" aria-hidden="true" />
            </div>
            <div className="absolute right-6 top-8 hidden h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:flex">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>

            <div className="absolute left-4 top-12 h-12 w-16 rounded-full border border-[var(--border)] opacity-70 md:h-16 md:w-24" style={{ borderColor: 'var(--border)', borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
            <div className="absolute right-4 bottom-8 h-12 w-14 rounded-full border border-[var(--border)] opacity-60 md:h-16 md:w-20" style={{ borderColor: 'var(--border)', borderLeftColor: 'transparent', borderBottomColor: 'transparent' }} />

            {moodboardItems.map((item) => (
              <motion.div
                key={item.key}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18, rotate: item.className.includes('-rotate') ? -10 : 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.45, delay: item.delay, ease: 'easeOut' }}
                whileHover={prefersReducedMotion ? undefined : { y: -6, rotate: item.key === 'editorial' ? -4 : item.key === 'cinematic' ? 4 : -1, scale: 1.01 }}
                className={`group absolute ${item.className}`}
              >
                <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_38px_rgba(15,23,42,0.12)]">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="block aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 md:p-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/60 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.14em] text-[var(--text)] shadow-sm backdrop-blur-sm md:text-[9px]">
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                      Moodboard
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(15,23,42,0.56)] via-[rgba(15,23,42,0.12)] to-transparent px-2.5 pb-2.5 pt-5 text-left md:px-3 md:pb-3 md:pt-6">
                    <span className="font-serif text-sm italic tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.4)] md:text-base">
                      {item.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="order-3 mt-1 flex flex-wrap gap-3 md:order-none md:col-start-1 md:row-start-2 md:mt-7">
          <Link to="/explore" onClick={() => trackEvent('explore_click', { source: 'home', destination: '/explore' })}>
            <Button className="shadow-[0_10px_22px_rgba(15,23,42,0.08)]">Explore styles</Button>
          </Link>
          <Link to="/explore" onClick={() => trackEvent('explore_click', { source: 'home', destination: '/explore' })}>
            <Button variant="secondary" className="shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
              Browse trending
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
