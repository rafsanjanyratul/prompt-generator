import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronDown, RotateCcw, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import promptStyles from '../data/prompts.js'
import StyleCard from '../components/discover/StyleCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import SearchInput from '../components/ui/SearchInput'
import SectionHeader from '../components/ui/SectionHeader'
import useDocumentMeta from '../hooks/useDocumentMeta'

const defaultFilters = {
  category: 'All',
  gender: 'All',
  style: 'All',
  trending: 'all',
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="min-h-[44px] w-full appearance-none rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 pr-10 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
      </div>
    </label>
  )
}

function ExplorePage() {
  const prefersReducedMotion = useReducedMotion()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(defaultFilters)

  useDocumentMeta({
    title: 'Explore AI Photo Styles',
    description:
      'Search, filter, and browse curated AI photo styles by mood, category, and trend for your next creative prompt.',
    ogTitle: 'Explore AI Photo Styles',
    ogDescription:
      'Browse AI photo styles by category, trend, and mood to find the right visual direction for your next prompt.',
  })

  const categoryOptions = useMemo(
    () => [{ label: 'All', value: 'All' }, ...new Set(promptStyles.map((item) => item.category))].map((category) =>
      typeof category === 'string' ? { label: category, value: category } : category
    ),
    []
  )
  const genderOptions = useMemo(
    () => [{ label: 'All', value: 'All' }, ...new Set(promptStyles.map((item) => item.gender))].map((gender) =>
      typeof gender === 'string' ? { label: gender, value: gender } : gender
    ),
    []
  )
  const styleOptions = useMemo(
    () => [{ label: 'All', value: 'All' }, ...new Set(promptStyles.map((item) => item.style))].map((style) =>
      typeof style === 'string' ? { label: style, value: style } : style
    ),
    []
  )
  const trendingOptions = [
    { label: 'Any', value: 'all' },
    { label: 'Trending only', value: 'true' },
    { label: 'Non-trending only', value: 'false' },
  ]

  const activeFilterCount = [
    filters.category !== 'All',
    filters.gender !== 'All',
    filters.style !== 'All',
    filters.trending !== 'all',
  ].filter(Boolean).length

  const filteredStyles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return promptStyles.filter((item) => {
      const searchableText = [
        item.title,
        item.shortDescription,
        item.category,
        item.gender,
        item.style,
        item.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = query.length === 0 || searchableText.includes(query)
      const matchesCategory = filters.category === 'All' || item.category === filters.category
      const matchesGender = filters.gender === 'All' || item.gender === filters.gender
      const matchesStyle = filters.style === 'All' || item.style === filters.style
      const matchesTrending =
        filters.trending === 'all'
          ? true
          : filters.trending === 'true'
            ? Boolean(item.trending)
            : !item.trending

      return matchesSearch && matchesCategory && matchesGender && matchesStyle && matchesTrending
    })
  }, [filters, searchTerm])

  const activeFilters = [
    filters.category !== 'All' ? `Category: ${filters.category}` : null,
    filters.gender !== 'All' ? `Gender: ${filters.gender}` : null,
    filters.style !== 'All' ? `Style: ${filters.style}` : null,
    filters.trending !== 'all' ? `Trending: ${filters.trending === 'true' ? 'On' : 'Off'}` : null,
  ].filter(Boolean)

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const resetAll = () => {
    setSearchTerm('')
    setFilters(defaultFilters)
  }

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <SectionHeader
          eyebrow="Browse"
          title="Explore AI photo styles"
          description="Search premium visual directions, narrow by mood and audience, and discover prompts you can adapt to your next image generation workflow."
        />

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-[32rem]">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search styles, tags, category, or mood"
            />
          </div>

          {activeFilterCount > 0 || searchTerm.trim() ? (
            <Button
              variant="secondary"
              size="sm"
              className="inline-flex items-center gap-2 self-start lg:self-auto"
              onClick={resetAll}
              aria-label="Clear search and filters"
            >
              <RotateCcw className="size-4" />
              Clear filters
            </Button>
          ) : null}
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
              <SlidersHorizontal className="size-4" />
              <span>Filters</span>
            </div>
            {activeFilterCount > 0 ? (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {activeFilterCount} active
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              options={categoryOptions}
            />
            <FilterSelect
              label="Gender"
              value={filters.gender}
              onChange={(value) => handleFilterChange('gender', value)}
              options={genderOptions}
            />
            <FilterSelect
              label="Style"
              value={filters.style}
              onChange={(value) => handleFilterChange('style', value)}
              options={styleOptions}
            />
            <FilterSelect
              label="Trending"
              value={filters.trending}
              onChange={(value) => handleFilterChange('trending', value)}
              options={trendingOptions}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]" aria-live="polite">
            <Sparkles className="size-4 text-[var(--brand)]" />
            <span>
              Showing <strong className="font-semibold text-[var(--text)]">{filteredStyles.length}</strong> styles
            </span>
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
              {activeFilters.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]"
                >
                  {label}
                  <X className="size-3" aria-hidden="true" />
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {filteredStyles.length > 0 ? (
          <motion.div
            layout
            className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {filteredStyles.map((item, index) => (
              <motion.div
                key={item.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03, ease: 'easeOut' }}
              >
                <StyleCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No styles found"
              description="Try a different keyword or clear some filters to broaden the search."
              action={
                <Button variant="secondary" className="inline-flex items-center gap-2" onClick={resetAll}>
                  <RotateCcw className="size-4" />
                  Reset search
                </Button>
              }
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ExplorePage
