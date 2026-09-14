import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowUpRight, Check, Copy, ImageOff, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import promptStyles from '../data/prompts.js'
import StyleCard from '../components/discover/StyleCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { trackEvent } from '../lib/analytics.js'

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

  useEffect(() => {
    if (!style) return

    trackEvent('style_view', {
      style_id: style.id,
      style_slug: style.slug,
      style_title: style.title,
      category: style.category,
      style_type: style.style,
    })
  }, [style])

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
      trackEvent('prompt_copy', {
        style_id: style.id,
        style_slug: style.slug,
        style_title: style.title,
        category: style.category,
      })
      setTimeout(() => setCopyState('idle'), 1600)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 1800)
    }
  }

  useDocumentMeta({
    title: style ? style.title : 'Style not found',
    description: style
      ? `${style.shortDescription} Explore the ${style.category} ${style.style.toLowerCase()} style prompt and related visual inspiration.`
      : 'The requested style could not be found in the current collection.',
    ogTitle: style ? style.title : 'Style not found',
    ogDescription: style ? style.shortDescription : 'This style is not currently available in the collection.',
    ogType: 'article',
    robots: style ? 'index,follow' : 'noindex,follow',
  })

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

  const workflowSteps = [
    { number: '01', label: 'Copy' },
    { number: '02', label: 'Upload' },
    { number: '03', label: 'Paste' },
    { number: '04', label: 'Create' },
  ]

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
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            <ArrowLeft className="size-3.5" />
            Browse more
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[var(--surface-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              {!imageFailed ? (
                <img
                  src={style.image}
                  alt={style.title}
                  loading="eager"
                  decoding="async"
                  width={800}
                  height={1000}
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

            <div className="space-y-4">
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Prompt
                  </p>
                  {copyState === 'error' ? (
                    <span className="text-xs font-medium text-[var(--error)]">Copy unavailable</span>
                  ) : null}
                </div>

                <div className="relative">
                  <div className="max-h-[280px] overflow-y-auto overscroll-contain rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-sm leading-7 text-[var(--text)] [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] sm:max-h-[320px] md:text-[15px] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-track]:bg-transparent">
                    <p className="m-0 whitespace-pre-wrap break-words">{style.prompt}</p>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--surface-muted)] to-transparent" />
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className={`inline-flex w-full items-center justify-center gap-2 sm:w-auto ${
                      copyState === 'success'
                        ? 'border-[var(--success)] bg-[var(--success)] text-[var(--background)] hover:-translate-y-0'
                        : copyState === 'error'
                          ? 'border-[var(--error)] bg-[var(--surface)] text-[var(--error)] hover:-translate-y-0'
                          : ''
                    }`}
                    onClick={handleCopyPrompt}
                    aria-live="polite"
                    aria-label={`${copyLabel} prompt`}
                  >
                    {copyState === 'success' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copyLabel}
                  </Button>
                </div>
              </div>

              <motion.section
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-[26px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-muted)_100%)] p-4 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:p-5"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_38%),radial-gradient(circle_at_left,rgba(52,211,153,0.1),transparent_30%)]" />

                <div className="relative">
                  <div className="mb-4 flex items-center gap-3 text-[var(--text)]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--brand-soft)] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                      <Sparkles className="size-4" aria-hidden="true" />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Ready to Create?
                    </p>
                  </div>

                  <div className="mb-4 space-y-1">
                    <p className="m-0 text-base font-semibold text-[var(--text)] sm:text-lg">
                      Your prompt is ready.
                    </p>
                    <p className="m-0 text-sm text-[var(--text-muted)]">
                      Choose an AI tool and create your image.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href="https://chatgpt.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent('create_with_chatgpt', {
                          style_id: style.id,
                          style_slug: style.slug,
                          style_title: style.title,
                          category: style.category,
                        })
                      }
                      aria-label="Create with ChatGPT opens in a new tab"
                      className="group relative flex min-h-[52px] flex-1 items-center justify-between gap-2 rounded-[18px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(155,135,255,0.12),rgba(145,158,255,0.04))] px-4 py-3 text-left text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                          <Sparkles className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-semibold">
                          Create with
                          <span className="mt-0.5 block text-base font-bold">ChatGPT</span>
                        </span>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </a>

                    <a
                      href="https://gemini.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent('create_with_gemini', {
                          style_id: style.id,
                          style_slug: style.slug,
                          style_title: style.title,
                          category: style.category,
                        })
                      }
                      aria-label="Create with Gemini opens in a new tab"
                      className="group relative flex min-h-[52px] flex-1 items-center justify-between gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)]">
                          <Sparkles className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-semibold">
                          Create with
                          <span className="mt-0.5 block text-base font-bold">Gemini</span>
                        </span>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </a>
                  </div>

                  <div className="mt-5 border-t border-[var(--border)] pt-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] sm:justify-start">
                      {workflowSteps.map((step, index) => (
                        <div key={step.number} className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[9px] font-semibold text-[var(--text)]">
                            {step.number}
                          </span>
                          <span>{step.label}</span>
                          {index < workflowSteps.length - 1 ? (
                            <span className="h-px w-3 bg-[var(--border)]" aria-hidden="true" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
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
              className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3"
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
