import CategoryCard from './CategoryCard'
import SectionHeader from '../ui/SectionHeader'

const categories = [
  {
    category: 'Boys',
    description: 'Crisp portraits, vintage character, and polished lifestyle framing.',
    href: '/explore',
  },
  {
    category: 'Girls',
    description: 'Soft editorial looks, natural beauty portraits, and warm light direction.',
    href: '/explore',
  },
  {
    category: 'Couples',
    description: 'Romantic storytelling, cinematic emotion, and intimate connection.',
    href: '/explore',
  },
  {
    category: 'Family',
    description: 'Authentic moments, cozy portraits, and lifestyle storytelling.',
    href: '/explore',
  },
]

function CategorySection() {
  return (
    <section className="py-8 md:py-10">
      <SectionHeader
        eyebrow="Categories"
        title="Browse by mood and moment"
        description="Choose a category to explore a visual direction that matches the people, mood, and story you want to create."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((item) => (
          <CategoryCard
            key={item.category}
            category={item.category}
            description={item.description}
            href={item.href}
          />
        ))}
      </div>
    </section>
  )
}

export default CategorySection
