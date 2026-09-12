import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'

function HomePage() {
  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <section className="grid items-center gap-8 pb-16 pt-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-[40rem]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Discover new AI photo looks
          </p>
          <h1 className="m-0 text-[clamp(2.8rem,5vw,4.6rem)] leading-[0.96] tracking-[-0.06em] text-[var(--text)]">
            Find the style you want before you prompt.
          </h1>
          <p className="mt-4 max-w-[34rem] text-[1.08rem] text-[var(--text-muted)]">
            Browse curated AI image styles and turn inspiration into a prompt you can use instantly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Explore styles</Button>
            <Button variant="secondary">Browse trending</Button>
          </div>
        </div>

        <div className="grid min-h-[420px] grid-cols-2 gap-4" aria-label="Featured style preview">
          <div
            className="flex min-h-[220px] items-end rounded-[var(--radius-xl)] border border-[var(--border)] p-4 font-semibold text-[var(--text)] shadow-[0_8px_24px_var(--shadow)]"
            style={{
              background: 'linear-gradient(180deg, #d9d0c4, var(--surface))',
            }}
          >
            <span>Editorial portrait</span>
          </div>
          <div
            className="mt-8 flex min-h-[220px] items-end rounded-[var(--radius-xl)] border border-[var(--border)] p-4 font-semibold text-[var(--text)] shadow-[0_8px_24px_var(--shadow)]"
            style={{
              background: 'linear-gradient(180deg, #e7e4df, var(--surface))',
            }}
          >
            <span>Warm cinematic</span>
          </div>
        </div>
      </section>

      <section className="py-4">
        <SectionHeader
          eyebrow="Featured"
          title="Trending inspiration"
          description="Curated visual directions for people who want photo-shopping results that feel polished and natural."
        />
      </section>
    </div>
  )
}

export default HomePage
