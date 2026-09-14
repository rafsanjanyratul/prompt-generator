import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Heart, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { trackEvent } from '../../lib/analytics.js'

const categoryMeta = {
  Boys: {
    accent: 'from-[#e8d5c4] to-[#f6efe8]',
    icon: Sparkles,
  },
  Girls: {
    accent: 'from-[#f1d7e6] to-[#f9f1f5]',
    icon: Sparkles,
  },
  Couples: {
    accent: 'from-[#d9d9ed] to-[#f3f1f8]',
    icon: Heart,
  },
  Family: {
    accent: 'from-[#dfe9d4] to-[#eef5ea]',
    icon: Users,
  },
}

function CategoryCard({ category, description, href = '#', displayCategory = category }) {
  const meta = categoryMeta[category] ?? {
    accent: 'from-[#f0efe9] to-[#f7f5f2]',
    icon: Sparkles,
  }
  const Icon = meta.icon
  const prefersReducedMotion = useReducedMotion()
  const title = displayCategory ?? category

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
      className="h-full"
    >
      <Link
        to={href}
        onClick={() => trackEvent('category_select', { category, source: 'home' })}
        className="group block h-full overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-[var(--focus)] hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] md:rounded-[28px] md:p-4"
      >
        <div className="rounded-[18px] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-elevated),var(--surface-muted))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:rounded-[22px] md:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.08)] text-[var(--text)] shadow-sm md:h-11 md:w-11" aria-hidden="true">
              <Icon className="size-4 md:size-5" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] md:px-2.5 md:py-1 md:text-[10px]">
              Explore
              <ArrowUpRight className="size-3" />
            </span>
          </div>
          <div className="mt-8 md:mt-12">
            <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text)] md:text-2xl">{title}</h3>
            <p className="mt-2 line-clamp-3 break-words text-[11px] leading-5 text-[var(--text-muted)] md:text-sm md:leading-6">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default CategoryCard
