import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

function StyleCard({ item }) {
  if (!item) {
    return null
  }

  return (
    <Link
      to={`/styles/${item.slug}`}
      className="group block overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={(event) => {
            event.currentTarget.src = '/images/placeholders/placeholder-style.jpg'
          }}
        />
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
  )
}

export default StyleCard
