import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

function StyleCard({ item }) {
  const [imageFailed, setImageFailed] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  if (!item) {
    return null
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      className="h-full"
    >
      <Link
        to={`/styles/${item.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--focus)] hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        <div className="relative overflow-hidden">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface-muted)]">
            {!imageFailed ? (
              <img
                src={item.image}
                alt={item.title}
                className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onError={() => setImageFailed(true)}
              />
            ) : null}

            {imageFailed ? (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--surface-muted)] via-[var(--surface)] to-[var(--brand-soft)] p-6 text-center">
                <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                    <ImageOff className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium uppercase tracking-[0.12em]">Preview</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
            <Badge tone="brand">{item.category}</Badge>
            {item.trending ? <Badge tone="success">Trending</Badge> : null}
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--text)]">{item.title}</h3>
          </div>

          <p className="text-sm leading-6 text-[var(--text-muted)]">{item.shortDescription}</p>

          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={`${item.id}-${tag}`}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default StyleCard
