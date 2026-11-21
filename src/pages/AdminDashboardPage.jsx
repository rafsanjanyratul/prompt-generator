import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, FileText, Plus, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { getAllPrompts } from '../lib/promptsApi.js'

function AdminDashboardPage() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPrompts() {
      try {
        const data = await getAllPrompts()

        if (isMounted) {
          setPrompts(Array.isArray(data) ? data : [])
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.message || 'Unable to load prompt data right now.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPrompts()

    return () => {
      isMounted = false
    }
  }, [])

  useDocumentMeta({
    title: 'Admin Overview',
    description: 'Administrative overview for PromptTouch AI prompt management and content operations.',
    ogTitle: 'PromptTouch AI Admin Dashboard',
    ogDescription: 'Manage prompts, monitor featured and trending content, and review quick admin metrics.',
  })

  const { featuredPrompts, trendingCount, topCategory } = useMemo(() => {
    const categoryCounts = new Map()
    const featured = []
    let trending = 0

    prompts.forEach((prompt) => {
      if (prompt.featured === true) {
        featured.push(prompt)
      }
      if (prompt.trending === true) {
        trending += 1
      }

      const category = prompt.category?.trim()
      if (category) {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
      }
    })

    const mostCommonCategory = Array.from(categoryCounts.entries()).sort((first, second) => second[1] - first[1])[0]

    return {
      featuredPrompts: featured,
      trendingCount: trending,
      topCategory: mostCommonCategory,
    }
  }, [prompts])

  const summaryCards = [
    {
      label: 'Total Prompts',
      value: loading || error ? '—' : prompts.length,
      detail: loading ? 'Loading catalog data...' : error ? 'Data unavailable' : 'Public prompts in catalog',
      icon: FileText,
      tone: 'bg-[var(--brand-soft)] text-[var(--text)]',
    },
    {
      label: 'Featured Prompts',
      value: loading || error ? '—' : featuredPrompts.length,
      detail: loading ? 'Loading catalog data...' : error ? 'Data unavailable' : 'Marked as featured',
      icon: Sparkles,
      tone: 'bg-[rgba(122,92,69,0.08)] text-[var(--brand-accent)]',
    },
    {
      label: 'Trending Prompts',
      value: loading || error ? '—' : trendingCount,
      detail: loading ? 'Loading catalog data...' : error ? 'Data unavailable' : 'Marked as trending',
      icon: TrendingUp,
      tone: 'bg-[rgba(28,124,84,0.08)] text-[var(--success)]',
    },
  ]

  const overviewNotes = [
    {
      label: 'Top category',
      value: loading ? 'Loading...' : error ? 'Unavailable' : topCategory ? `${topCategory[0]} (${topCategory[1]})` : 'No category data',
    },
    {
      label: 'Featured coverage',
      value: loading ? 'Loading...' : error ? 'Unavailable' : prompts.length ? `${Math.round((featuredPrompts.length / prompts.length) * 100)}%` : 'No prompts yet',
    },
    {
      label: 'Trending coverage',
      value: loading ? 'Loading...' : error ? 'Unavailable' : prompts.length ? `${Math.round((trendingCount / prompts.length) * 100)}%` : 'No prompts yet',
    },
  ]

  const catalogStatus = loading ? 'Loading prompt data' : error ? 'Catalog unavailable' : 'Catalog data loaded'

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AdminSidebar>
          <div className="mt-6 rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Catalog status</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text)]">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${error ? 'bg-[var(--error)]' : loading ? 'bg-[var(--text-muted)]' : 'bg-[var(--success)]'}`} aria-hidden="true" />
              {catalogStatus}
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">PromptTouch AI public prompt catalog</p>
          </div>
        </AdminSidebar>

        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Overview</p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">Admin dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                Monitor the PromptTouch AI catalog, review featured content, and keep the prompt library fresh for your audience.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
              <span className={`inline-flex size-2 rounded-full ${error ? 'bg-[var(--error)]' : loading ? 'bg-[var(--text-muted)]' : 'bg-[var(--success)]'}`} aria-hidden="true" />
              {catalogStatus}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/admin/manage-prompts"
              className="flex-1 rounded-full bg-[#171717] px-5 py-3 text-center text-base font-semibold !text-[#FFFFFF] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                Manage Prompts
                <ArrowRight className="size-4 !text-[#FFFFFF]" aria-hidden="true" />
              </span>
            </Link>
            <Link
              to="/admin/prompts/new"
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-center text-base font-semibold text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--focus)] hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Plus className="size-4" aria-hidden="true" />
                Add New Prompt
              </span>
            </Link>
          </div>

          {error ? (
            <div role="alert" className="mt-6 rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {summaryCards.map(({ label, value, detail, icon: Icon, tone }) => (
              <div key={label} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
                    <p className="mt-4 text-3xl font-bold tracking-[-0.06em] text-[var(--text)]">{value}</p>
                  </div>
                  <span className={`inline-flex size-11 items-center justify-center rounded-[14px] ${tone}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-4 text-sm text-[var(--text-muted)]">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Content mix</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">Featured picks</h2>
                </div>
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {loading || error ? '—' : `${featuredPrompts.length} featured`}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <p className="text-sm text-[var(--text-muted)]">Loading featured prompts...</p>
                ) : error ? (
                  <p className="text-sm text-[var(--text-muted)]">Featured prompts are unavailable.</p>
                ) : featuredPrompts.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No featured prompts yet.</p>
                ) : (
                  featuredPrompts.slice(0, 3).map((prompt) => (
                    <div key={prompt.slug} className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--brand-accent)]" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--text)]">{prompt.title}</p>
                      </div>
                      <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        {prompt.category || 'Uncategorized'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Quick notes</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">This week</h2>

              <div className="mt-6 space-y-4">
                {overviewNotes.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-sm text-[var(--text-muted)]">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--text)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
