import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Check, Copy, ImageOff } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import promptStyles from '../data/prompts.js'
import StyleCard from '../components/discover/StyleCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

function StyleDetailPage() {
  const { slug } = useParams()
  const prefersReducedMotion = useReducedMotion()
  const [imageFailed, setImageFailed] = useState(false)
  const [copyState, setCopyState] = useState('idle')

  const style = useMemo(
    () => promptStyles.find((item) => item.slug === slug),
    [slug]
  )

  useEffect(() => {
    setImageFailed(false)
    setCopyState('idle')
  }, [slug])

  const relatedStyles = useMemo(() => {
    if (!style) return []

    return promptStyles
      .filter(
        (item) => item.id !== style.id && (item.category === style.category || item.style === style.style)
      )
      .slice(0, 3)
  }, [style])

  const handleCopyPrompt = async () => {
    if (!style) return

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(style.prompt)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = style.prompt
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
      setTimeout(() => setCopyState('idle'), 1600)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 1800)
    }
  }

  if (!style) {
    return (
      <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-16">
        <EmptyState
          title="Style not found"
          description="This style isn’t in the current collection. Head back to browse other visual directions."
          action={
            <Link to="/explore">
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4" />
                Back to Explore
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const copyLabel =
    copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy Prompt'

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16 md:py-10">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            <ArrowLeft className="size-4" />
            Back to Explore
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[var(--surface-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              {!imageFailed ? (
                <img
                  src={style.image}
                  alt={style.title}
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : null}

              {imageFailed ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--surface-muted)] via-[var(--surface)] to-[var(--brand-soft)] p-6 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                      <ImageOff className="size-6" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium uppercase tracking-[0.12em]">Preview</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--brand-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text)]">
                  {style.category}
                </span>
                {style.trending ? (
                  <span className="rounded-full border border-transparent bg-[rgba(28,124,84,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--success)]">
                    Trending
                  </span>
                ) : null}
              </div>

              <div>
                <h1 className="m-0 text-[clamp(2.4rem,5vw,4rem)] leading-[0.96] tracking-[-0.07em] text-[var(--text)]">
                  {style.title}
                </h1>
              </div>

              <p className="m-0 max-w-[38rem] text-base leading-7 text-[var(--text-muted)] md:text-lg">
                {style.shortDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Gender
                </p>
                <p className="mt-2 text-base font-medium text-[var(--text)]">{style.gender}</p>
              </div>
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Style
                </p>
                <p className="mt-2 text-base font-medium text-[var(--text)]">{style.style}</p>
              </div>
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Tags
                </p>
                <p className="mt-2 text-base font-medium text-[var(--text)]">{style.tags.length}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className={`inline-flex items-center gap-2 ${
                  copyState === 'success'
                    ? 'bg-[var(--success)] text-[var(--background)] hover:-translate-y-0'
                    : copyState === 'error'
                      ? 'border border-[var(--error)] bg-[var(--surface)] text-[var(--error)] hover:-translate-y-0'
                      : ''
                }`}
                onClick={handleCopyPrompt}
                aria-live="polite"
                aria-label={`${copyLabel} prompt`}
              >
                {copyState === 'success' ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copyLabel}
              </Button>
              <Link to="/explore">
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Browse more
                </Button>
              </Link>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Prompt
                </p>
                {copyState === 'error' ? (
                  <span className="text-xs font-medium text-[var(--error)]">Copy unavailable</span>
                ) : null}
              </div>
              <p className="m-0 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text)] md:text-[15px]">
                {style.prompt}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {style.tags.map((tag) => (
                <span
                  key={`${style.id}-${tag}`}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {relatedStyles.length > 0 ? (
          <div className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  More styles
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)]">
                  You may also like
                </h2>
              </div>
            </div>

            <motion.div
              layout
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {relatedStyles.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
                >
                  <StyleCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}

export default StyleDetailPage
