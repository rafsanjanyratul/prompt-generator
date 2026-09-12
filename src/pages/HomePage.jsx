import HeroSection from '../components/discover/HeroSection'
import DiscoverySection from '../components/discover/DiscoverySection'
import CategorySection from '../components/discover/CategorySection'
import promptStyles from '../data/prompts'

function HomePage() {
  const featuredStyles = promptStyles.filter((item) => item.featured)
  const trendingStyles = promptStyles.filter((item) => item.trending)

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <HeroSection />

      <DiscoverySection
        eyebrow="Featured"
        title="Featured styles"
        description="A hand-picked set of visual looks that feel premium, usable, and easy to adapt into your own prompt workflow."
        items={featuredStyles}
      />

      <DiscoverySection
        eyebrow="Trending"
        title="Trending inspiration"
        description="Fresh, popular directions people are using to create more cinematic, artistic, and natural portrait looks."
        items={trendingStyles}
      />

      <CategorySection />
    </div>
  )
}

export default HomePage
