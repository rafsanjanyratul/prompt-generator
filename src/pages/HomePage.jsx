import HeroSection from '../components/discover/HeroSection'
import DiscoverySection from '../components/discover/DiscoverySection'
import CategorySection from '../components/discover/CategorySection'
import promptStyles from '../data/prompts'
import useDocumentMeta from '../hooks/useDocumentMeta'

function HomePage() {
  const featuredStyles = promptStyles.filter((item) => item.featured)
  const trendingStyles = promptStyles.filter((item) => item.trending)

  useDocumentMeta({
    title: 'Discover AI Photo Styles',
    description:
      'Browse curated AI photo-style prompts for portrait, lifestyle, editorial, and vintage-inspired image concepts.',
    ogTitle: 'AI Photo Style Discovery',
    ogDescription:
      'Explore curated AI photo styles for portraits, couples, family moments, and cinematic inspiration.',
  })

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <HeroSection />

      <CategorySection />

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
    </div>
  )
}

export default HomePage
