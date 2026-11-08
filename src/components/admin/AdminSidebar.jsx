import { FileText, LayoutGrid, PlusCircle, Sparkles, TrendingUp } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const ADMIN_PATH = '/admin'
const MANAGE_PROMPTS_PATH = '/admin/manage-prompts'
const NEW_PROMPT_PATH = '/admin/prompts/new'

const navItems = [
  { label: 'Overview', icon: LayoutGrid, to: ADMIN_PATH, pathname: ADMIN_PATH },
  { label: 'Manage Prompts', icon: FileText, to: MANAGE_PROMPTS_PATH, pathname: MANAGE_PROMPTS_PATH, filter: null },
  { label: 'New Prompt', icon: PlusCircle, to: NEW_PROMPT_PATH, pathname: NEW_PROMPT_PATH },
  {
    label: 'Featured',
    icon: Sparkles,
    to: `${MANAGE_PROMPTS_PATH}?filter=featured`,
    pathname: MANAGE_PROMPTS_PATH,
    filter: 'featured',
  },
  {
    label: 'Trending',
    icon: TrendingUp,
    to: `${MANAGE_PROMPTS_PATH}?filter=trending`,
    pathname: MANAGE_PROMPTS_PATH,
    filter: 'trending',
  },
]

const knownFilters = ['featured', 'trending']

function normalizePathname(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

function isItemActive(item, location) {
  if (normalizePathname(location.pathname) !== item.pathname) {
    return false
  }

  // Items without a `filter` key only care about the pathname.
  if (!('filter' in item)) {
    return true
  }

  const currentFilter = new URLSearchParams(location.search).get('filter')
  const activeFilter = knownFilters.includes(currentFilter) ? currentFilter : null

  return activeFilter === item.filter
}

function AdminSidebar({ children = null }) {
  const location = useLocation()

  return (
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
        {navItems.map((item) => {
          const { label, icon: Icon, to } = item
          const isActive = isItemActive(item, location)

          return (
            <Link
              key={label}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--surface-muted)] text-[var(--text)] shadow-[inset_0_0_0_1px_rgba(15,23,42,0.03)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {children}
    </aside>
  )
}

export default AdminSidebar
