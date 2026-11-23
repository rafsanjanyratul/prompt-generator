import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import HeroSection from '../components/discover/HeroSection'
import DiscoverySection from '../components/discover/DiscoverySection'
import CategorySection from '../components/discover/CategorySection'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
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
    ogImage: '/images/styles/boys/old-money-luxury-elegance.webp',
    twitterTitle: 'AI Photo Style Discovery',
    twitterDescription:
      'Explore curated AI photo styles for portraits, couples, family moments, and cinematic inspiration.',
    twitterImage: '/images/styles/boys/old-money-luxury-elegance.webp',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'PromptTouch AI',
      url: window.location.origin,
    },
  })

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <HeroSection />

      <CategorySection />

      <section className="my-4 flex flex-col gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="space-y-1.5">
          <h2 className="m-0 text-xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-2xl">
            Make Your Ideas Better with AI
          </h2>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
            Turn simple ideas into detailed, creative AI image prompts with PromptTouch AI.
          </p>
        </div>
        <Link
          to="/ai-enhancer"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold !text-[#FFFFFF] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:self-center"
        >
          Try AI Enhancer
          <ArrowUpRight className="size-4 !text-[#FFFFFF]" aria-hidden="true" />
        </Link>
      </section>

      {isLoading ? (
        <div className="mt-8 flex justify-center rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          <LoadingSpinner label="Loading styles" />
        </div>
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
            revealOnScroll={false}
          />
        </>
      )}
    </div>
  )
}

export default HomePage
