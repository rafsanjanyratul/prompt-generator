import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { deleteUserPrompt, getUserPrompts, updateUserPrompt } from '../lib/authApi.js'

function normalizePromptTags(value) {
  if (!value) return []

  const list = Array.isArray(value) ? value : String(value).split(',')

  return Array.from(
    new Set(
      list
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item && item.length > 0)
    )
  )
}

function MyPromptsPage() {
  const { user, logout } = useAuth()
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [deletePrompt, setDeletePrompt] = useState(null)
  const [copyState, setCopyState] = useState('idle')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleCopyPrompt = async () => {
    if (!selectedPrompt?.prompt) return

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(selectedPrompt.prompt)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = selectedPrompt.prompt
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand('copy')
        document.body.removeChild(textarea)

        if (!copied) {
          throw new Error('Clipboard copy failed')
        }
      }

      setCopyState('success')
      toast.success('Prompt copied to clipboard.')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('error')
      toast.error('Unable to copy this prompt right now.')
      window.setTimeout(() => setCopyState('idle'), 1800)
    }
  }

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(null)
    setEditingPrompt({
      ...prompt,
      tags: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : '',
    })
  }

  const handleUpdateSubmit = async (event) => {
    event.preventDefault()

    if (!editingPrompt?._id || isSaving) {
      return
    }

    const payload = {
      title: editingPrompt.title.trim(),
      prompt: editingPrompt.prompt.trim(),
      description: (editingPrompt.description || '').trim(),
      category: editingPrompt.category.trim(),
      style: editingPrompt.style.trim(),
      tags: normalizePromptTags(editingPrompt.tags),
    }

    if (!payload.title || !payload.prompt || !payload.category || !payload.style) {
      setError('Title, prompt, category, and style are required.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const updatedPrompt = await updateUserPrompt(editingPrompt._id, payload)
      const nextPrompt = updatedPrompt || { ...editingPrompt, ...payload, tags: payload.tags }

      setPrompts((current) => current.map((prompt) => (prompt._id === nextPrompt._id ? nextPrompt : prompt)))
      setSelectedPrompt(nextPrompt)
      setEditingPrompt(null)
      setCopyState('idle')
      toast.success('Prompt updated successfully.')
    } catch (updateError) {
      const updateMessage = updateError?.message || 'Unable to update this prompt right now.'
      setError(updateMessage)
      toast.error(updateMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePrompt = (prompt) => {
    if (!prompt || isDeleting) return
    setDeletePrompt(prompt)
  }

  const confirmDeletePrompt = async () => {
    if (!deletePrompt?._id || isDeleting) return

    setIsDeleting(true)
    setError('')

    try {
      await deleteUserPrompt(deletePrompt._id)
      setPrompts((current) => current.filter((prompt) => prompt._id !== deletePrompt._id))

      if (selectedPrompt?._id === deletePrompt._id) {
        setSelectedPrompt(null)
      }

      if (editingPrompt?._id === deletePrompt._id) {
        setEditingPrompt(null)
      }

      setDeletePrompt(null)
      toast.success('Prompt deleted successfully.')
    } catch (deleteError) {
      const deleteMessage = deleteError?.message || 'Unable to delete this prompt right now.'
      setError(deleteMessage)
      toast.error(deleteMessage)
    } finally {
      setIsDeleting(false)
    }
  }

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
        <div className="flex justify-center rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          <LoadingSpinner label="Loading your prompts" />
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
            <article
              key={prompt._id}
              onClick={() => setSelectedPrompt(prompt)}
              className="cursor-pointer rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-transform duration-200 hover:-translate-y-0.5"
            >
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
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <span
                      key={`${prompt._id}-${tag}`}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span>
                  {prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently created'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedPrompt(prompt)
                    }}
                    className="font-medium text-[var(--brand)]"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleEditPrompt(prompt)
                    }}
                    className="font-medium text-[var(--text)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDeletePrompt(prompt)
                    }}
                    className="font-medium text-red-600 disabled:opacity-60"
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {deletePrompt ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_30px_60px_rgba(15,23,42,0.2)] sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
                <Trash2 className="size-5" aria-hidden="true" />
              </div>
              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Confirm</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)]">Delete Prompt?</h3>
              </div>
            </div>

            <p className="text-sm leading-7 text-[var(--text-muted)]">
              Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deletePrompt.title}</span>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setDeletePrompt(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={confirmDeletePrompt}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-500"
              >
                {isDeleting ? 'Deleting...' : 'Delete Prompt'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_30px_60px_rgba(15,23,42,0.2)] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Saved prompt</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)]">{selectedPrompt.title}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPrompt(null)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)]"
              >
                Close
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {selectedPrompt.category ? (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    {selectedPrompt.category}
                  </span>
                ) : null}
                {selectedPrompt.style ? (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    {selectedPrompt.style}
                  </span>
                ) : null}
              </div>

              {selectedPrompt.description ? (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Description</p>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">{selectedPrompt.description}</p>
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Prompt</p>
                <div className="max-h-[320px] overflow-y-auto rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-7 text-[var(--text)] sm:text-[15px]">
                  <p className="m-0 whitespace-pre-wrap break-words">{selectedPrompt.prompt}</p>
                </div>
              </div>

              {selectedPrompt.tags && selectedPrompt.tags.length > 0 ? (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag) => (
                      <span key={`${selectedPrompt._id}-${tag}`} className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)]">{tag}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="primary" size="sm" onClick={handleCopyPrompt}>
                  {copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy Prompt'}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => handleEditPrompt(selectedPrompt)}>
                  Edit
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDeletePrompt(selectedPrompt)} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>

              {copyState === 'error' ? (
                <p className="text-sm text-red-600">Unable to copy this prompt right now.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {editingPrompt ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_30px_60px_rgba(15,23,42,0.2)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Edit prompt</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)]">Update saved prompt</h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingPrompt(null)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Title</span>
                <input
                  type="text"
                  value={editingPrompt.title}
                  onChange={(event) => setEditingPrompt((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  placeholder="Prompt title"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Category</span>
                <input
                  type="text"
                  value={editingPrompt.category}
                  onChange={(event) => setEditingPrompt((current) => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  placeholder="General"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Style</span>
                <input
                  type="text"
                  value={editingPrompt.style}
                  onChange={(event) => setEditingPrompt((current) => ({ ...current, style: event.target.value }))}
                  className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  placeholder="Cinematic"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Description</span>
                <textarea
                  rows="4"
                  value={editingPrompt.description || ''}
                  onChange={(event) => setEditingPrompt((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  placeholder="Describe the prompt"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Tags</span>
                <input
                  type="text"
                  value={editingPrompt.tags}
                  onChange={(event) => setEditingPrompt((current) => ({ ...current, tags: event.target.value }))}
                  className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  placeholder="portrait, cinematic, editorial"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Prompt</span>
                <textarea
                  rows="10"
                  value={editingPrompt.prompt}
                  onChange={(event) => setEditingPrompt((current) => ({ ...current, prompt: event.target.value }))}
                  className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                  placeholder="Paste the full prompt text"
                />
              </label>

              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEditingPrompt(null)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MyPromptsPage
