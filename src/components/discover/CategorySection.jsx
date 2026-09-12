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

function CategorySection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, x: -24, y: 12 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
      className="py-8 md:py-10"
    >
      <SectionHeader
        eyebrow="Categories"
        title="Browse by mood and moment"
        description="Choose a category to explore a visual direction that matches the people, mood, and story you want to create."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((item, index) => (
          <motion.div
            key={item.category}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -18 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
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
