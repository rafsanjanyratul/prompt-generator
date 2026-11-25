import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
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

const FALLBACK_IMAGES = [
  {
    src: '/images/styles/boys/old-money-luxury-elegance.webp',
    alt: 'Old money luxury editorial portrait',
    label: 'Luxury',
    slug: 'fallback-1',
  },
  {
    src: '/images/styles/couples/royalty-heritage-wedding.webp',
    alt: 'Royal heritage wedding portrait',
    label: 'Heritage',
    slug: 'fallback-2',
  },
  {
    src: '/images/styles/couples/sunset-beach-romance.webp',
    alt: 'Sunset beach romance portrait',
    label: 'Romance',
    slug: 'fallback-3',
  },
  {
    src: '/images/styles/boys/minimalist-clean-aesthetic.webp',
    alt: 'Minimalist clean aesthetic portrait',
    label: 'Minimalist',
    slug: 'fallback-4',
  },
  {
    src: '/images/styles/boys/athletic-&-fitness-aesthetic.webp',
    alt: 'Athletic fitness aesthetic portrait',
    label: 'Athletic',
    slug: 'fallback-5',
  },
]

const AUTO_ROTATE_INTERVAL = 2200
const ORBIT_RADIUS_X_DESKTOP = 275
const DRAG_ANGLE_SENSITIVITY = 0.55
const DRAG_THRESHOLD = 45
const VELOCITY_SLOW = 0.3
const VELOCITY_FAST = 0.8
const MAX_SWIPE_POSITIONS = 3

function selectCarouselImages(promptStyles) {
  if (!Array.isArray(promptStyles) || promptStyles.length === 0) {
    return FALLBACK_IMAGES
  }

  const seen = new Set()
  const images = []

  const pushUnique = (item) => {
    if (!item.image || seen.has(item.image)) return false
    seen.add(item.image)
    images.push({
      src: item.image,
      alt: item.shortDescription || item.title || 'Style preview',
      label: item.title,
      slug: item.slug || String(item.id),
    })
    return images.length >= 10
  }

  for (const item of promptStyles) {
    if (item.featured && pushUnique(item)) break
  }
  if (images.length < 10) {
    for (const item of promptStyles) {
      if (item.trending && pushUnique(item)) break
    }
  }
  if (images.length < 10) {
    for (const item of promptStyles) {
      if (pushUnique(item)) break
    }
  }

  return images.length >= 1 ? images : FALLBACK_IMAGES
}

function getOrbitConfig(relativePos, total, dragAngle = 0, orbitRadiusX = ORBIT_RADIUS_X_DESKTOP) {
  const angleStep = 360 / total
  const angleDeg = relativePos * angleStep + dragAngle
  const angleRad = (angleDeg * Math.PI) / 180

  const x = orbitRadiusX * Math.sin(angleRad)
  const y = -orbitRadiusX * 0.28 * (1 - Math.cos(angleRad)) // elliptical lift at sides/rear
  const frontness = (Math.cos(angleRad) + 1) / 2 // 1 at front (0°), 0 at back (180°)

  const scale = 0.42 + 0.58 * frontness
  const rotateY = angleDeg * 0.65
  const opacity = 0.35 + 0.65 * frontness
  const zIndex = Math.round(frontness * 30)

  return { x, y, scale, rotateY, opacity, zIndex }
}

function HeroSection({ promptStyles = [] }) {
  const prefersReducedMotion = useReducedMotion()
  const [visibleHeadline, setVisibleHeadline] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const carouselImages = useMemo(() => selectCarouselImages(promptStyles), [promptStyles])
  const total = carouselImages.length
  const intervalRef = useRef(null)
  const dragStartX = useRef(0)
  const dragStartTime = useRef(0)
  const [orbitRadiusX, setOrbitRadiusX] = useState(ORBIT_RADIUS_X_DESKTOP)

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth >= 768) {
        setOrbitRadiusX(Math.min(window.innerWidth * 0.21, ORBIT_RADIUS_X_DESKTOP))
      } else {
        setOrbitRadiusX(Math.min(window.innerWidth * 0.38, 165))
      }
    }
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  const wrapIndex = useCallback(
    (index) => ((index % total) + total) % total,
    [total],
  )

  const goTo = useCallback((index) => {
    setActiveIndex(wrapIndex(index))
  }, [wrapIndex])

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (prefersReducedMotion || total === 0) return

    intervalRef.current = setInterval(() => {
      if (!isDragging && !isHovered) {
        next()
      }
    }, AUTO_ROTATE_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [prefersReducedMotion, total, next, isDragging, isHovered])

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const onDragStart = useCallback((e) => {
    if (prefersReducedMotion) return
    setIsDragging(true)
    dragStartX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
    dragStartTime.current = Date.now()
    setDragOffset(0)
    stopAutoplay()
  }, [prefersReducedMotion, stopAutoplay])

  const onDragMove = useCallback((e) => {
    if (!isDragging) return
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
    const offset = currentX - dragStartX.current
    setDragOffset(offset)
  }, [isDragging])

  const onDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const offset = dragOffset
    const endTime = Date.now()
    const elapsed = Math.max(endTime - dragStartTime.current, 1)
    const velocity = Math.abs(offset) / elapsed

    const dragAngle = offset * DRAG_ANGLE_SENSITIVITY
    const angleStep = 360 / total
    const positionsFromDistance = Math.round(dragAngle / angleStep)

    // Velocity-based positions: fast swipe advances more positions
    let positionsFromVelocity = 0
    if (Math.abs(offset) > DRAG_THRESHOLD) {
      positionsFromVelocity = 1
      if (velocity > VELOCITY_FAST) positionsFromVelocity = MAX_SWIPE_POSITIONS
      else if (velocity > VELOCITY_SLOW) positionsFromVelocity = 2
    }

    // Use the greater magnitude of distance-based or velocity-based positions
    const finalPositions =
      Math.abs(positionsFromDistance) >= Math.abs(positionsFromVelocity)
        ? positionsFromDistance
        : positionsFromVelocity

    if (Math.abs(offset) > DRAG_THRESHOLD && total > 1) {
      goTo(wrapIndex(activeIndex - finalPositions))
    } else {
      // Threshold not crossed: snap to nearest orbit position
      goTo(wrapIndex(activeIndex - positionsFromDistance))
    }
    setDragOffset(0)
  }, [isDragging, dragOffset, total, goTo, activeIndex, VELOCITY_SLOW, VELOCITY_FAST, MAX_SWIPE_POSITIONS, DRAG_THRESHOLD, DRAG_ANGLE_SENSITIVITY])

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleHeadline(headlineText)
      return undefined
    }

    let cancelled = false
    let timeoutId

    const tick = (index = 0, deleting = false) => {
      if (cancelled) return

      const nextText = deleting
        ? headlineText.slice(0, index)
        : headlineText.slice(0, index + 1)
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
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [prefersReducedMotion])

  return (
    <section className="relative overflow-x-clip pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16 lg:pt-12">
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

      <div className="grid items-center gap-8 md:gap-4 lg:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="order-1 md:order-none">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Discover the style
          </p>

          <h1
            aria-label={headlineText}
            className="relative m-0 text-[clamp(2.8rem,6vw,5.1rem)] leading-[0.94] tracking-[-0.07em] text-[var(--text)]"
          >
            {/* Invisible full headline reserves the exact final wrapped height so the
                typewriter animation never changes the container height. */}
            <span className="invisible block" aria-hidden="true">
              {headlineText}
            </span>
            <span className="absolute inset-0 block">
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
          className="relative order-2 w-full md:order-none"
        >
          <div
            className="relative h-[300px] w-screen left-1/2 -translate-x-1/2 overflow-x-clip overflow-y-hidden sm:h-[340px] md:h-[420px] lg:h-[460px] cursor-grab active:cursor-grabbing perspective-[1000px] md:static md:w-full md:left-auto md:translate-x-0 md:overflow-x-clip"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerLeave={onDragEnd}
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 bg-transparent" />

            <div className="absolute left-4 top-12 h-12 w-16 rounded-full border border-[var(--border)] opacity-70 md:h-16 md:w-24" style={{ borderColor: 'var(--border)', borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
            <div className="absolute right-4 bottom-8 h-12 w-14 rounded-full border border-[var(--border)] opacity-60 md:h-16 md:w-20" style={{ borderColor: 'var(--border)', borderLeftColor: 'transparent', borderBottomColor: 'transparent' }} />

            {carouselImages.map((item, i) => {
              const rawPos = ((i - activeIndex + total) % total)
              const position = rawPos > Math.floor(total / 2) ? rawPos - total : rawPos

              const dragAngle = dragOffset * DRAG_ANGLE_SENSITIVITY
              const config = getOrbitConfig(position, total, dragAngle, orbitRadiusX)
              const isActive = position === 0

              return (
                <motion.div
                  key={item.slug || item.src}
                  style={{ left: '50%', top: '50%', zIndex: config.zIndex }}
                  animate={{
                    x: config.x,
                    y: config.y,
                    scale: config.scale,
                    rotateY: config.rotateY,
                    opacity: config.opacity,
                  }}
                  transition={{
                    ...(isDragging ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 22 }),
                    ...(prefersReducedMotion ? { duration: 0 } : {}),
                  }}
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  className={`absolute origin-center -translate-x-1/2 -translate-y-1/2 ${isActive ? 'pointer-events-auto' : 'pointer-events-none'} select-none`}
                >
                  <div
                    className={`relative overflow-hidden w-[150px] sm:w-[185px] md:w-[215px] lg:w-[240px] rounded-[22px] sm:rounded-[26px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_38px_rgba(15,23,42,0.12)] ${isActive ? 'shadow-[0_30px_70px_rgba(15,23,42,0.16)]' : ''}`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      width={400}
                      height={500}
                      loading={isActive ? 'eager' : 'lazy'}
                      decoding="async"
                      className="block aspect-[1/1.08] w-full h-full object-cover transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 top-0 hidden md:flex items-center justify-between p-2.5 md:p-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/60 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.14em] text-[var(--text)] shadow-sm backdrop-blur-sm md:text-[9px]">
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                        Moodboard
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 hidden md:block bg-gradient-to-t from-[rgba(15,23,42,0.56)] via-[rgba(15,23,42,0.12)] to-transparent px-2.5 pb-2.5 pt-5 text-left md:px-3 md:pb-3 md:pt-6">
                      <span className="font-serif text-sm italic tracking-[-0.04em] text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.4)] md:text-base">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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

