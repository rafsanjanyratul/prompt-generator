import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FileText, LayoutGrid, Pencil, Search, Sparkles, Trash2, TrendingUp } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

import EmptyState from '../components/ui/EmptyState.jsx'
import ImageUploadField from '../components/ui/ImageUploadField.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { deletePromptBySlug, getAllPrompts, updatePromptBySlug } from '../lib/promptsApi.js'

const navItems = [
  { label: 'Overview', icon: LayoutGrid, to: '/admin' },
  { label: 'Manage Prompts', icon: FileText, to: '/admin/manage-prompts' },
  { label: 'Featured', icon: Sparkles, to: '/admin' },
  { label: 'Trending', icon: TrendingUp, to: '/admin' },
]

function AdminManagePromptsPage() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [prompts, setPrompts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingSlug, setEditingSlug] = useState(null)
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [imageEditorOpen, setImageEditorOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true

    async function loadPrompts() {
      try {
        setLoading(true)
        setError('')

        const data = await getAllPrompts()

        if (!isMounted) {
          return
        }

        setPrompts(Array.isArray(data) ? data : [])
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        if (loadError?.message && /401|unauthorized|token/i.test(loadError.message)) {
          logout()
        }

        setError(loadError?.message || 'Unable to load prompts right now.')
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

  const filteredPrompts = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return prompts
    }

    return prompts.filter((prompt) => {
      const searchable = [
        prompt.title,
        prompt.shortDescription,
        prompt.category,
        prompt.gender,
        prompt.style,
        Array.isArray(prompt.tags) ? prompt.tags.join(' ') : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })
  }, [prompts, search])

  useDocumentMeta({
    title: 'Manage Prompts',
    description: 'Manage PromptMuse prompt catalog entries and publication states from the admin dashboard.',
    ogTitle: 'PromptMuse Admin Manage Prompts',
    ogDescription: 'Review, edit, and remove PromptMuse prompt entries from the admin dashboard.',
  })

  const beginEdit = (prompt) => {
    setEditingSlug(prompt.slug)
    setDraft({
      title: prompt.title || '',
      shortDescription: prompt.shortDescription || '',
      category: prompt.category || '',
      gender: prompt.gender || '',
      style: prompt.style || '',
      tags: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : '',
      image: prompt.image || '',
      prompt: prompt.prompt || '',
      featured: Boolean(prompt.featured),
      trending: Boolean(prompt.trending),
    })
    setImageEditorOpen(false)
    setError('')
  }

  const handleDraftChange = (event) => {
    const { name, value, type, checked } = event.target

    setDraft((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async () => {
    if (!editingSlug) {
      return
    }

    const payload = {
      title: draft.title?.trim(),
      shortDescription: draft.shortDescription?.trim(),
      category: draft.category?.trim(),
      gender: draft.gender?.trim(),
      style: draft.style?.trim(),
      tags: Array.from(
        new Set(
          String(draft.tags || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ),
      image: draft.image?.trim() || '',
      prompt: draft.prompt?.trim() || '',
      featured: Boolean(draft.featured),
      trending: Boolean(draft.trending),
    }

    if (!payload.title || !payload.shortDescription || !payload.category || !payload.gender || !payload.style || !payload.prompt || !payload.image) {
      setError('Title, description, category, gender, style, full prompt, and image are required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const updatedPrompt = await updatePromptBySlug(editingSlug, payload)
      const nextPrompt = { ...prompts.find((prompt) => prompt.slug === editingSlug), ...updatedPrompt }

      setPrompts((current) => current.map((prompt) => (prompt.slug === editingSlug ? nextPrompt : prompt)))
      setEditingSlug(null)
      setDraft({})
      setImageEditorOpen(false)
      toast.success(`${payload.title} updated successfully.`)
    } catch (saveError) {
      const message = saveError?.message || 'Unable to update this prompt right now.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      await deletePromptBySlug(deleteTarget.slug)
      setPrompts((current) => current.filter((prompt) => prompt.slug !== deleteTarget.slug))
      setDeleteTarget(null)
      if (editingSlug === deleteTarget.slug) {
        setEditingSlug(null)
        setDraft({})
        setImageEditorOpen(false)
      }
      toast.success(`${deleteTarget.title} deleted.`)
    } catch (deleteError) {
      const message = deleteError?.message || 'Unable to delete this prompt right now.'
      setError(message)
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  if (!user) {
    return null
  }

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
            {navItems.map(({ label, icon: Icon, to }) => {
              const isActive = location.pathname === to

              return (
                <Link
                  key={label}
                  to={to}
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
        </aside>

        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)]">
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Overview
                </Link>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">Manage prompts</h1>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
              {prompts.length} total prompts
            </div>
          </div>

          <div className="mt-6">
            <label className="relative block">
              <span className="sr-only">Search prompts</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, style, category, or tag"
                className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-muted)] py-3 pl-11 pr-4 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--focus)]"
              />
            </label>
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-8">
              <LoadingSpinner label="Loading prompts" />
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : filteredPrompts.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title={search ? 'No matching prompts' : 'No prompts found'}
                description={
                  search
                    ? 'Try a different search term or clear the filter to view the full catalog.'
                    : 'The prompt library is empty right now.'
                }
                action={
                  search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Clear search
                    </button>
                  ) : null
                }
              />
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Gender</th>
                      <th className="px-4 py-3 font-semibold">Style</th>
                      <th className="px-4 py-3 font-semibold">Featured</th>
                      <th className="px-4 py-3 font-semibold">Trending</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrompts.map((prompt) => {
                      const isEditing = editingSlug === prompt.slug

                      if (isEditing) {
                        return (
                          <tr key={prompt.slug} className="border-b border-[var(--border)] bg-[var(--surface)] align-top">
                            <td colSpan="7" className="p-4">
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                  Title
                                  <input
                                    type="text"
                                    name="title"
                                    value={draft.title || ''}
                                    onChange={handleDraftChange}
                                    className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                                  />
                                </label>

                                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                  Category
                                  <input
                                    type="text"
                                    name="category"
                                    value={draft.category || ''}
                                    onChange={handleDraftChange}
                                    className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                                  />
                                </label>

                                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                  Gender
                                  <input
                                    type="text"
                                    name="gender"
                                    value={draft.gender || ''}
                                    onChange={handleDraftChange}
                                    className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                                  />
                                </label>

                                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] md:col-span-2 xl:col-span-2">
                                  Description
                                  <textarea
                                    name="shortDescription"
                                    value={draft.shortDescription || ''}
                                    onChange={handleDraftChange}
                                    rows="3"
                                    className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                                  />
                                </label>

                                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                  Style
                                  <input
                                    type="text"
                                    name="style"
                                    value={draft.style || ''}
                                    onChange={handleDraftChange}
                                    className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                                  />
                                </label>

                                <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] md:col-span-2 xl:col-span-2">
                                  Tags
                                  <input
                                    type="text"
                                    name="tags"
                                    value={draft.tags || ''}
                                    onChange={handleDraftChange}
                                    placeholder="comma separated tags"
                                    className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                                  />
                                </label>

                                <div className="md:col-span-2 xl:col-span-3">
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Full prompt</p>
                                  </div>
                                  <textarea
                                    name="prompt"
                                    value={draft.prompt || ''}
                                    onChange={handleDraftChange}
                                    rows="8"
                                    className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm leading-6 text-[var(--text)] outline-none focus:border-[var(--focus)]"
                                  />
                                </div>

                                <div className="md:col-span-2 xl:col-span-3">
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Image</p>
                                    <button
                                      type="button"
                                      onClick={() => setImageEditorOpen((open) => !open)}
                                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:border-[var(--focus)]"
                                    >
                                      {imageEditorOpen ? 'Hide editor' : 'Change Image'}
                                    </button>
                                  </div>

                                  {draft.image ? (
                                    <div className="mb-3 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                                      <img
                                        src={draft.image}
                                        alt={draft.title || 'Prompt image preview'}
                                        className="h-28 w-full rounded-[12px] object-cover"
                                      />
                                    </div>
                                  ) : null}

                                  {imageEditorOpen ? (
                                    <ImageUploadField
                                      label="Image"
                                      value={draft.image || ''}
                                      onChange={(nextValue) => setDraft((current) => ({ ...current, image: nextValue }))}
                                      placeholder="https://example.com/image.webp"
                                      required
                                    />
                                  ) : (
                                    <p className="text-xs leading-6 text-[var(--text-muted)]">
                                      Current image path is preserved unless you choose to change it.
                                    </p>
                                  )}
                                </div>

                                <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                                  <input
                                    type="checkbox"
                                    name="featured"
                                    checked={Boolean(draft.featured)}
                                    onChange={handleDraftChange}
                                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--brand)]"
                                  />
                                  Featured
                                </label>

                                <label className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                                  <input
                                    type="checkbox"
                                    name="trending"
                                    checked={Boolean(draft.trending)}
                                    onChange={handleDraftChange}
                                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--brand)]"
                                  />
                                  Trending
                                </label>
                              </div>

                              <div className="mt-4 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSlug(null)
                                    setDraft({})
                                    setImageEditorOpen(false)
                                    setError('')
                                  }}
                                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)]"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {saving ? 'Saving...' : 'Save changes'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }

                      return (
                        <tr key={prompt.slug} className="border-b border-[var(--border)] bg-[var(--surface)] last:border-b-0">
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-[var(--text)]">{prompt.title}</div>
                            <div className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-muted)]">
                              {prompt.shortDescription || 'No description available.'}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-[var(--text)]">{prompt.category || '—'}</td>
                          <td className="px-4 py-3 align-top text-[var(--text)]">{prompt.gender || '—'}</td>
                          <td className="px-4 py-3 align-top text-[var(--text)]">{prompt.style || '—'}</td>
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                prompt.featured
                                  ? 'bg-[rgba(28,124,84,0.12)] text-[var(--success)]'
                                  : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                              }`}
                            >
                              {prompt.featured ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                prompt.trending
                                  ? 'bg-[rgba(122,92,69,0.12)] text-[var(--brand-accent)]'
                                  : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                              }`}
                            >
                              {prompt.trending ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => beginEdit(prompt)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--focus)]"
                              >
                                <Pencil className="size-3.5" aria-hidden="true" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(prompt)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:border-red-300"
                              >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_24px_62px_rgba(15,23,42,0.24)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Confirm delete</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)]">Delete prompt?</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{deleteTarget.title}</span>? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-full bg-[var(--error)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete prompt'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminManagePromptsPage
