import { Link } from 'react-router-dom'
import Button from '../ui/Button'

function HeroSection() {
  return (
    <section className="grid items-center gap-8 pb-12 pt-8 md:gap-10 lg:grid-cols-[1.14fr_0.86fr] lg:pb-16 lg:pt-12">
      <div className="max-w-[40rem]">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Discover the style
        </p>
        <h1 className="m-0 text-[clamp(2.8rem,6vw,5.1rem)] leading-[0.94] tracking-[-0.07em] text-[var(--text)]">
          Find the look. Copy the prompt. Create your next image.
        </h1>
        <p className="mt-5 max-w-[35rem] text-base leading-7 text-[var(--text-muted)] md:text-lg">
          Browse premium AI photo styles for portraits, couples, family moments, and retro-inspired
          aesthetics. Then use the ready-to-copy prompt to bring the look to life.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/explore">
            <Button className="shadow-[0_10px_22px_rgba(15,23,42,0.08)]">Explore styles</Button>
          </Link>
          <Link to="/explore">
            <Button variant="secondary" className="shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
              Browse trending
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-56 rounded-[22px] bg-gradient-to-br from-[#d5c2ad] via-[#f7f0ea] to-[#e8e2da] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="flex h-full items-end text-sm font-semibold text-[var(--text)]">Editorial portrait</div>
          </div>
          <div className="mt-8 h-56 rounded-[22px] bg-gradient-to-br from-[#f1d7d7] via-[#f9f1f0] to-[#ebe2e1] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="flex h-full items-end text-sm font-semibold text-[var(--text)]">Soft cinematic</div>
          </div>
          <div className="col-span-2 h-44 rounded-[22px] bg-gradient-to-br from-[#dfe4ef] via-[#f4f1f6] to-[#e4ead9] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="flex h-full items-end text-sm font-semibold text-[var(--text)]">Warm family lifestyle</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
