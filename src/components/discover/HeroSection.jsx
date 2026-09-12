import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { trackEvent } from '../../lib/analytics.js'

const rotatingPhrases = [
  'Create your next image.',
  'Bring your vision to life.',
  'Turn inspiration into photos.',
  'Create something unforgettable.',
]

const moodboardItems = [
  {
    key: 'editorial',
    src: '/images/styles/girls/sunlit-girl-editorial.webp',
    alt: 'Sunlit girl editorial portrait',
    label: 'Editorial portrait',
    className: 'left-0 top-5 w-[52%] -rotate-6',
    delay: 0.1,
  },
  {
    key: 'cinematic',
    src: '/images/styles/couples/romantic-couple-street-scene.webp',
    alt: 'Romantic couple street scene portrait',
    label: 'Soft cinematic',
    className: 'right-0 top-11 w-[58%] rotate-[8deg]',
    delay: 0.2,
  },
  {
    key: 'family',
    src: '/images/styles/family/cozy-family-portrait.webp',
    alt: 'Cozy family portrait',
    label: 'Warm family lifestyle',
    className: 'left-12 bottom-0 w-[64%] -rotate-[3deg]',
    delay: 0.3,
  },
]

function HeroSection() {
  const prefersReducedMotion = useReducedMotion()
  const [activePhrase, setActivePhrase] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setActivePhrase((current) => (current + 1) % rotatingPhrases.length)
    }, 2600)

    return () => window.clearInterval(interval)
  }, [prefersReducedMotion])

  return (
    <section className="relative overflow-hidden pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16 lg:pt-12">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(245,185,120,0.18),transparent_46%),radial-gradient(circle_at_bottom_right,_rgba(147,197,253,0.14),transparent_38%)]" />

      <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="max-w-[40rem]">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Discover the style
          </p>

          <h1 className="m-0 text-[clamp(2.8rem,6vw,5.1rem)] leading-[0.94] tracking-[-0.07em] text-[var(--text)]">
            <span className="block">Find the look.</span>
            <span className="mt-1 block">Copy the prompt.</span>
            <span className="mt-1 block min-h-[1.2em]">
              <motion.span
                key={activePhrase}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1.5 text-[0.52em] font-medium italic tracking-[-0.04em] text-[var(--text)] shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
              >
                <span className="text-[var(--brand)]">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                </span>
                {rotatingPhrases[activePhrase]}
              </motion.span>
            </span>
          </h1>

          <p className="mt-5 max-w-[35rem] text-base leading-7 text-[var(--text-muted)] md:text-lg">
            Browse premium AI photo styles for portraits, couples, family moments, and retro-inspired
            aesthetics. Then use the ready-to-copy prompt to bring the look to life.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
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

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 18, y: 12 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          className="relative"
        >
          <div className="relative mx-auto h-[420px] w-full max-w-[30rem] overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]/85 p-4 shadow-[0_24px_64px_rgba(15,23,42,0.08)] md:h-[460px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(245,192,128,0.18),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(157,178,255,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_55%)]" />

            <div className="absolute left-10 top-5 hidden h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:flex">
              <Star className="size-4" aria-hidden="true" />
            </div>

            <div className="absolute right-8 top-9 hidden h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:flex">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>

            <div className="absolute left-4 top-14 h-16 w-24 rounded-full border border-[var(--border)] opacity-70" style={{ borderColor: 'var(--border)', borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
            <div className="absolute right-4 bottom-10 h-16 w-20 rounded-full border border-[var(--border)] opacity-60" style={{ borderColor: 'var(--border)', borderLeftColor: 'transparent', borderBottomColor: 'transparent' }} />

            {moodboardItems.map((item) => (
              <motion.div
                key={item.key}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18, rotate: item.className.includes('-rotate') ? -10 : 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.45, delay: item.delay, ease: 'easeOut' }}
                whileHover={prefersReducedMotion ? undefined : { y: -6, rotate: item.key === 'editorial' ? -4 : item.key === 'cinematic' ? 4 : -1, scale: 1.01 }}
                className={`group absolute ${item.className}`}
              >
                <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_38px_rgba(15,23,42,0.12)]">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="block aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/55 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--text)] shadow-sm backdrop-blur-sm">
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                      Moodboard
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(15,23,42,0.56)] via-[rgba(15,23,42,0.12)] to-transparent px-3 pb-3 pt-6 text-left">
                    <span className="font-serif text-base italic tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.4)]">
                      {item.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
