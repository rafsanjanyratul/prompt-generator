import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getUserPrompts } from '../lib/authApi.js'

function MyPromptsPage() {
  const { user, logout } = useAuth()
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true

    async function loadPrompts() {
      try {
        const data = await getUserPrompts()
        if (!isMounted) return

        setPrompts(Array.isArray(data) ? data : [])
        setError('')
      } catch (loadError) {
        if (!isMounted) return

        if (loadError?.message && /401|unauthorized|token/i.test(loadError.message)) {
          logout()
        }

        setError(loadError?.message || 'Unable to load your prompts right now.')
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
  }, [logout, user])

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Saved prompts</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[var(--text)]">My Prompts</h1>
        </div>

        <Link to="/create">
          <Button variant="primary" size="md">
            Create new prompt
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--text-muted)]">
          Loading your prompts...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && prompts.length === 0 ? (
        <EmptyState
          title="No prompts yet"
          description="Create your first personal prompt and it will appear here."
          action={
            <Link to="/create">
              <Button variant="primary" size="md">
                Create prompt
              </Button>
            </Link>
          }
        />
      ) : null}

      {!loading && !error && prompts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => (
            <article key={prompt._id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {prompt.category || 'General'}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">{prompt.title}</h2>
                </div>
                {prompt.style ? (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    {prompt.style}
                  </span>
                ) : null}
              </div>

              <p className="line-clamp-5 text-sm leading-6 text-[var(--text-muted)]">{prompt.prompt}</p>

              {prompt.tags && prompt.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
                    <span
                      key={`${prompt._id}-${tag}`}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 text-xs text-[var(--text-muted)]">
                {prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently created'}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default MyPromptsPage
