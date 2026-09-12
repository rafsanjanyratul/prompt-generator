import { Link } from 'react-router-dom'

const categoryMeta = {
  Boys: {
    accent: 'from-[#e8d5c4] to-[#f6efe8]',
    emoji: '👦',
  },
  Girls: {
    accent: 'from-[#f1d7e6] to-[#f9f1f5]',
    emoji: '👧',
  },
  Couples: {
    accent: 'from-[#d9d9ed] to-[#f3f1f8]',
    emoji: '💑',
  },
  Family: {
    accent: 'from-[#dfe9d4] to-[#eef5ea]',
    emoji: '👨‍👩‍👧‍👦',
  },
}

function CategoryCard({ category, description, href = '#' }) {
  const meta = categoryMeta[category] ?? {
    accent: 'from-[#f0efe9] to-[#f7f5f2]',
    emoji: '✨',
  }

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 transition-transform duration-200 hover:-translate-y-1"
    >
      <div className={`rounded-[22px] bg-gradient-to-br ${meta.accent} p-5`}>
        <div className="flex items-center justify-between">
          <span className="text-3xl" aria-hidden="true">{meta.emoji}</span>
          <span className="rounded-full border border-[var(--border)] bg-white/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Explore
          </span>
        </div>
        <div className="mt-12">
          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{category}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default CategoryCard
