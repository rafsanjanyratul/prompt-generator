import SectionHeader from '../ui/SectionHeader'
import StyleCard from './StyleCard'

function DiscoverySection({ eyebrow, title, description, items, emptyText = 'No styles available yet.' }) {
  if (!items || items.length === 0) {
    return (
      <section className="py-8 md:py-10">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--text-muted)]">
          {emptyText}
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-10">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <StyleCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default DiscoverySection
