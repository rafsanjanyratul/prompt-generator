import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'

function HomePage() {
  return (
    <div className="container page-shell">
      <section className="hero-block">
        <div className="hero-copy">
          <p className="eyebrow">Discover new AI photo looks</p>
          <h1>Find the style you want before you prompt.</h1>
          <p className="lede">
            Browse curated AI image styles and turn inspiration into a prompt you can use instantly.
          </p>
          <div className="hero-actions">
            <Button>Explore styles</Button>
            <Button variant="secondary">Browse trending</Button>
          </div>
        </div>

        <div className="hero-visual" aria-label="Featured style preview">
          <div className="hero-card hero-card--primary">
            <span>Editorial portrait</span>
          </div>
          <div className="hero-card hero-card--secondary">
            <span>Warm cinematic</span>
          </div>
        </div>
      </section>

      <section className="section-block">
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
