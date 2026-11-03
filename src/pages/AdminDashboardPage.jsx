import { ArrowRight, FileText, LayoutGrid, Plus, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import useDocumentMeta from '../hooks/useDocumentMeta'

const navItems = [
  { label: 'Overview', icon: LayoutGrid, to: '/admin', active: true },
  { label: 'Manage Prompts', icon: FileText, to: '/admin/manage-prompts' },
  { label: 'Featured', icon: Sparkles, to: '/admin' },
  { label: 'Trending', icon: TrendingUp, to: '/admin' },
]

const summaryCards = [
  {
    label: 'Total Prompts',
    value: '1,284',
    change: '+12.4% this month',
    icon: FileText,
    tone: 'bg-[var(--brand-soft)] text-[var(--text)]',
  },
  {
    label: 'Featured Prompts',
    value: '64',
    change: '+8 curated this week',
    icon: Sparkles,
    tone: 'bg-[rgba(122,92,69,0.08)] text-[var(--brand-accent)]',
  },
  {
    label: 'Trending Prompts',
    value: '27',
    change: '+5 in trending list',
    icon: TrendingUp,
    tone: 'bg-[rgba(28,124,84,0.08)] text-[var(--success)]',
  },
]

const spotlightItems = [
  { name: 'Editorial Portrait', status: 'Published', accent: 'bg-[var(--success)]' },
  { name: 'Luxury Wedding', status: 'Featured', accent: 'bg-[var(--brand-accent)]' },
  { name: 'Cinematic Streetwear', status: 'Draft', accent: 'bg-[var(--text-muted)]' },
]

function AdminDashboardPage() {
  useDocumentMeta({
    title: 'Admin Overview',
    description: 'Administrative overview for PromptMuse prompt management and content operations.',
    ogTitle: 'PromptMuse Admin Dashboard',
    ogDescription: 'Manage prompts, monitor featured and trending content, and review quick admin metrics.',
  })

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] lg:p-5">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
            <span className="inline-flex size-10 items-center justify-center rounded-[0.9rem] border border-[var(--border)] bg-[var(--brand-soft)] text-sm font-bold text-[var(--text)]">
              P
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">PromptMuse</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">Admin console</p>
            </div>
          </div>

          <nav className="mt-5 space-y-2" aria-label="Admin navigation">
            {navItems.map(({ label, icon: Icon, to, active }) => (
              <Link
                key={label}
                to={to}
                className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--surface-muted)] text-[var(--text)] shadow-[inset_0_0_0_1px_rgba(15,23,42,0.03)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">System status</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text)]">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
              All services online
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">Prompt catalog updates and moderation checks are running normally.</p>
          </div>
        </aside>

        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Overview</p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">Admin dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                Monitor the PromptMuse catalog, review featured content, and keep the prompt library fresh for your audience.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
              <span className="inline-flex size-2 rounded-full bg-[var(--success)]" aria-hidden="true" />
              Updated 2 min ago
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/admin/manage-prompts"
              className="flex-1 rounded-full bg-[var(--brand)] px-5 py-3 text-center text-base font-semibold text-[var(--background)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                Manage Prompts
                <ArrowRight className="size-4" aria-hidden="true" />
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

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {summaryCards.map(({ label, value, change, icon: Icon, tone }) => (
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
                <p className="mt-4 text-sm text-[var(--text-muted)]">{change}</p>
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
                  Weekly
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {spotlightItems.map(({ name, status, accent }) => (
                  <div key={name} className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text)]">{name}</p>
                    </div>
                    <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Quick notes</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">This week</h2>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Top collection</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text)]">Portrait styles</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Most saved</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text)]">Old Money Elegance</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Review queue</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text)]">12 prompts due</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
