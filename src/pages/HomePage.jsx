import { useEffect, useState } from 'react'

import HeroSection from '../components/discover/HeroSection'
import DiscoverySection from '../components/discover/DiscoverySection'
import CategorySection from '../components/discover/CategorySection'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { getAllPrompts } from '../lib/promptsApi.js'

function HomePage() {
  const [promptStyles, setPromptStyles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPrompts() {
      try {
        setIsLoading(true)
        setError('')

        const prompts = await getAllPrompts()

        if (isMounted) {
          setPromptStyles(Array.isArray(prompts) ? prompts : [])
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Unable to load prompts.')
          setPromptStyles([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPrompts()

    return () => {
      isMounted = false
    }
  }, [])

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

      {isLoading ? (
        <div className="mt-8 text-center text-sm text-[var(--text-muted)]">Loading styles...</div>
      ) : error ? (
        <div className="mt-8 text-center text-sm text-red-600">{error}</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

export default HomePage
