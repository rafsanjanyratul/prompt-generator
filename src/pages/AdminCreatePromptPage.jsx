import { useState } from 'react'
import { ArrowLeft, CheckCircle2, FileText, LayoutGrid, PlusCircle, Sparkles, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import ImageUploadField from '../components/ui/ImageUploadField.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { createPrompt } from '../lib/promptsApi.js'

const navItems = [
  { label: 'Overview', icon: LayoutGrid, to: '/admin' },
  { label: 'Manage Prompts', icon: FileText, to: '/admin/manage-prompts' },
  { label: 'New Prompt', icon: PlusCircle, to: '/admin/prompts/new', active: true },
  { label: 'Featured', icon: Sparkles, to: '/admin' },
  { label: 'Trending', icon: TrendingUp, to: '/admin' },
]

const initialForm = {
  id: '',
  slug: '',
  title: '',
  shortDescription: '',
  category: '',
  gender: '',
  style: '',
  tags: '',
  image: '',
  prompt: '',
  featured: false,
  trending: false,
}

function AdminCreatePromptPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useDocumentMeta({
    title: 'Add New Prompt',
    description: 'Create a new public PromptMuse prompt entry from the admin dashboard.',
    ogTitle: 'PromptMuse Admin Add New Prompt',
    ogDescription: 'Create and publish a new public prompt for the PromptMuse catalog from the admin dashboard.',
  })

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!Number.isInteger(Number(form.id)) || Number(form.id) <= 0) {
      return 'ID must be a positive integer.'
    }

    if (!form.slug.trim()) return 'Slug is required.'
    if (!form.title.trim()) return 'Title is required.'
    if (!form.shortDescription.trim()) return 'Short description is required.'
    if (!form.category.trim()) return 'Category is required.'
    if (!form.gender.trim()) return 'Gender is required.'
    if (!form.style.trim()) return 'Style is required.'
    if (!form.image.trim()) return 'Image URL is required.'
    if (!form.prompt.trim()) return 'Prompt text is required.'

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationMessage = validateForm()
    if (validationMessage) {
      setError(validationMessage)
      setSuccess(false)
      return
    }

    const payload = {
      id: Number(form.id),
      slug: form.slug.trim(),
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      category: form.category.trim(),
      gender: form.gender.trim(),
      style: form.style.trim(),
      tags: String(form.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      image: form.image.trim(),
      prompt: form.prompt.trim(),
      featured: Boolean(form.featured),
      trending: Boolean(form.trending),
    }

    setSubmitting(true)
    setError('')

    try {
      await createPrompt(payload)
      setSuccess(true)
      toast.success('Public prompt created successfully.')
      navigate('/admin/manage-prompts')
    } catch (submitError) {
      setSuccess(false)
      const message = submitError?.message || 'Unable to create this prompt right now.'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
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
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--text)] sm:text-4xl">Add New Prompt</h1>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
              <PlusCircle className="size-3.5" aria-hidden="true" />
              Public catalog entry
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error ? (
              <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : null}

            {success ? (
              <div className="flex items-center gap-2 rounded-[20px] border border-[var(--success)]/20 bg-[rgba(28,124,84,0.06)] p-4 text-sm font-medium text-[var(--success)]">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Prompt created successfully.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                ID
                <input
                  type="number"
                  min="1"
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="101"
                />
              </label>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Slug
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="luxury-portrait"
                />
              </label>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] xl:col-span-1">
                Category
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="Boys, Couples, Girls, Family"
                />
              </label>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Title
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="Luxury Portrait"
                />
              </label>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Gender
                <input
                  type="text"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="Male, Mixed, Female, Unisex"
                />
              </label>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Style
                <input
                  type="text"
                  name="style"
                  value={form.style}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="Vintage"
                />
              </label>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] md:col-span-2 xl:col-span-3">
                Short description
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="A polished editorial portrait direction for premium brand creative work."
                />
              </label>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] md:col-span-2 xl:col-span-3">
                Tags
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="editorial, luxury, portrait"
                />
              </label>

              <div className="md:col-span-2 xl:col-span-3">
                <ImageUploadField
                  label="Image"
                  value={form.image}
                  onChange={(nextValue) => setForm((current) => ({ ...current, image: nextValue }))}
                  placeholder="/images/styles/boys/luxury-portrait.webp"
                  required
                />
              </div>

              <label className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] md:col-span-2 xl:col-span-3">
                Full prompt
                <textarea
                  name="prompt"
                  value={form.prompt}
                  onChange={handleChange}
                  rows="7"
                  className="mt-1 w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--focus)]"
                  placeholder="Create a premium editorial portrait..."
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="inline-flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-medium text-[var(--text)]">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--brand)]"
                />
                Featured prompt
              </label>

              <label className="inline-flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-medium text-[var(--text)]">
                <input
                  type="checkbox"
                  name="trending"
                  checked={form.trending}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--brand)]"
                />
                Trending prompt
              </label>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Link
                to="/admin/manage-prompts"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--focus)]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating prompt...' : 'Create prompt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminCreatePromptPage
