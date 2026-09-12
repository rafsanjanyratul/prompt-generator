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

function CategoryCard({ category, description, href = '#' }) {
  const meta = categoryMeta[category] ?? {
    accent: 'from-[#f0efe9] to-[#f7f5f2]',
    icon: Sparkles,
  }
  const Icon = meta.icon
  const prefersReducedMotion = useReducedMotion()

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
        className="group block h-full overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-[var(--focus)] hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        <div className="rounded-[22px] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-elevated),var(--surface-muted))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.08)] text-[var(--text)] shadow-sm" aria-hidden="true">
              <Icon className="size-5" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Explore
              <ArrowUpRight className="size-3" />
            </span>
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{category}</h3>
            <p className="mt-2 break-words text-sm leading-6 text-[var(--text-muted)]">{description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default CategoryCard
