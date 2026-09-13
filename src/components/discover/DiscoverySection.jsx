import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import SectionHeader from '../ui/SectionHeader'
import StyleCard from './StyleCard'

function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = (event) => setIsSmallScreen(event.matches)

    setIsSmallScreen(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return isSmallScreen
}

function DiscoverySection({ eyebrow, title, description, items, emptyText = 'No styles available yet.' }) {
  const prefersReducedMotion = useReducedMotion()
  const isSmallScreen = useIsSmallScreen()
  const slideDirection = eyebrow === 'Featured' ? 1 : -1

  if (!items || items.length === 0) {
    return (
      <motion.section
        initial={prefersReducedMotion ? false : isSmallScreen ? false : { opacity: 0, x: slideDirection * 24, y: 12 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: isSmallScreen ? 0.24 : 0.42, ease: 'easeOut' }}
        className="py-8 md:py-10"
      >
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--text-muted)]">
          {emptyText}
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={prefersReducedMotion ? false : isSmallScreen ? false : { opacity: 0, x: slideDirection * 24, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: isSmallScreen ? 0.24 : 0.42, ease: 'easeOut' }}
      className="py-8 md:py-10"
    >
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={prefersReducedMotion ? false : isSmallScreen ? false : { opacity: 0, x: slideDirection * 18, y: 10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.04, duration: isSmallScreen ? 0.2 : 0.3, ease: 'easeOut' }}
          >
            <StyleCard item={item} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default DiscoverySection
