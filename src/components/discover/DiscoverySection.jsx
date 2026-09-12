import { motion, useReducedMotion } from 'motion/react'
import SectionHeader from '../ui/SectionHeader'
import StyleCard from './StyleCard'

function DiscoverySection({ eyebrow, title, description, items, emptyText = 'No styles available yet.' }) {
  const prefersReducedMotion = useReducedMotion()

  if (!items || items.length === 0) {
    return (
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, x: 24, y: 12 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
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
      initial={prefersReducedMotion ? false : { opacity: 0, x: eyebrow === 'Featured' ? 24 : -24, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
      className="py-8 md:py-10"
    >
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={prefersReducedMotion ? false : { opacity: 0, x: eyebrow === 'Featured' ? 18 : -18, y: 10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
          >
            <StyleCard item={item} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default DiscoverySection
