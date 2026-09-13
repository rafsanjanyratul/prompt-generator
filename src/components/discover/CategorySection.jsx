import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import CategoryCard from './CategoryCard'
import SectionHeader from '../ui/SectionHeader'

const categories = [
  {
    category: 'Boys',
    description: 'Crisp portraits, vintage character, and polished lifestyle framing.',
    href: '/explore?category=Boys',
  },
  {
    category: 'Girls',
    description: 'Soft editorial looks, natural beauty portraits, and warm light direction.',
    href: '/explore?category=Girls',
  },
  {
    category: 'Couples',
    description: 'Romantic storytelling, cinematic emotion, and intimate connection.',
    href: '/explore?category=Couples',
  },
  {
    category: 'Family',
    description: 'Authentic moments, cozy portraits, and lifestyle storytelling.',
    href: '/explore?category=Family',
  },
]

function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleChange = (event) => setIsSmallScreen(event.matches)

    setIsSmallScreen(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return isSmallScreen
}

function CategorySection() {
  const prefersReducedMotion = useReducedMotion()
  const isSmallScreen = useIsSmallScreen()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : isSmallScreen ? false : { opacity: 0, x: -24, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: isSmallScreen ? 0.24 : 0.42, ease: 'easeOut' }}
      className="py-8 md:py-10"
    >
      <SectionHeader
        eyebrow="Categories"
        title="Browse by mood and moment"
        description="Choose a category to explore a visual direction that matches the people, mood, and story you want to create."
      />

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((item, index) => (
          <motion.div
            key={item.category}
            initial={prefersReducedMotion ? false : isSmallScreen ? false : { opacity: 0, x: -18, y: 10 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.05, duration: isSmallScreen ? 0.18 : 0.3, ease: 'easeOut' }}
          >
            <CategoryCard
              category={item.category}
              description={item.description}
              href={item.href}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default CategorySection
