import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

function StyleCard({ item }) {
  const [imageFailed, setImageFailed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const displayCategory = item.category === 'Boys' ? 'Men' : item.category === 'Girls' ? 'Women' : item.category

  if (!item) {
    return null
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
      className="h-full"
    >
      <Link
        to={`/styles/${item.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-[var(--focus)] hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] md:rounded-[28px]"
      >
        <div className="relative overflow-hidden">
          <div className="relative aspect-[4/4.4] w-full overflow-hidden bg-[var(--surface-muted)] sm:aspect-[4/4.8] md:aspect-[4/5]">
            {!imageFailed ? (
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                width={480}
                height={600}
                className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onError={() => setImageFailed(true)}
              />
            ) : null}

            {imageFailed ? (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--surface-muted),var(--surface),var(--brand-soft))] p-4 text-center md:p-6">
                <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] md:gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] md:h-12 md:w-12">
                    <ImageOff className="size-4 md:size-5" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] md:text-sm">Preview</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-2.5 md:p-4">
            <Badge tone="brand">{displayCategory}</Badge>
            {item.trending ? <Badge tone="success">Trending</Badge> : null}
          </div>
        </div>

        <div className="space-y-2 p-3 md:space-y-3 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-[1.2] tracking-[-0.03em] text-[var(--text)] md:text-lg">
              {item.title}
            </h3>
          </div>

          <p className="line-clamp-2 break-words text-[11px] leading-5 text-[var(--text-muted)] md:text-sm md:leading-6">
            {item.shortDescription}
          </p>

          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={`${item.id}-${tag}`}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)] md:px-2.5 md:py-1 md:text-[10px]"
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
