import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  RotateCcw,
  Shuffle,
  Sparkles,
  Wand2,
} from 'lucide-react'
import {
  accessories,
  backgrounds,
  cameraSettings,
  colorGrading,
  compatibility,
  cultural,
  effects,
  expressions,
  identityPreservation,
  lighting,
  moods,
  poses,
  purposes,
  styles,
  subjects,
  timeOptions,
  weather,
  outfits,
} from '../data/createBuilderOptions.js'
import { trackEvent } from '../lib/analytics.js'
import Button from '../components/ui/Button.jsx'
import {
  buildPrompt,
  createDefaultBuilderSelections,
} from '../utils/promptBuilder.js'
import { randomizeBuilderSelections } from '../utils/randomizeBuilder.js'

const builderProgress = ['Subject', 'Format', 'Style', 'Scene', 'Advanced']

const initialBuilderState = createDefaultBuilderSelections()
const subjectLabelMap = {
  boys: 'Men',
  girls: 'Women',
  couples: 'Couples',
  family: 'Family',
}

function SectionHeader({ label, description }) {
  return (
    <div className="mb-3 space-y-1">
      <p className="m-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </p>
      {description ? <p className="m-0 text-sm text-[var(--text-muted)]">{description}</p> : null}
    </div>
  )
}

function SelectCardButton({ isSelected, onClick, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      className={`group relative flex min-h-[54px] w-full items-center justify-center rounded-[18px] border px-3 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
        isSelected
          ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)] shadow-[0_10px_24px_rgba(15,23,42,0.05)]'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--focus)] hover:text-[var(--text)]'
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}

function MultiSelectButton({ selected, onClick, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      className={`flex min-h-[42px] items-center justify-center rounded-full border px-3 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
        selected
          ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)]'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--focus)] hover:text-[var(--text)]'
      }`}
    >
      <span className="flex items-center gap-2">{children}</span>
    </button>
  )
}

function CreateIntro() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="mb-8"
    >
      <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--brand-soft)] text-[var(--text)]">
                <Sparkles className="size-3.5" aria-hidden="true" />
              </span>
              Create Your Style
            </div>

            <div className="space-y-3">
              <h1 className="m-0 text-[clamp(2.2rem,5vw,4.3rem)] leading-[0.95] tracking-[-0.07em] text-[var(--text)]">
                Create Your Own Style
              </h1>
              <p className="m-0 max-w-xl text-base leading-7 text-[var(--text-muted)] md:text-lg">
                Build a personalized AI photo prompt from your choices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] lg:self-center">
            <Wand2 className="size-3.5" aria-hidden="true" />
            Builder Preview
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function CreatePage() {
  const prefersReducedMotion = useReducedMotion()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [builder, setBuilder] = useState(initialBuilderState)
  const [copyState, setCopyState] = useState('idle')
  const previousPromptRef = useRef(buildPrompt(initialBuilderState).prompt)

  const generatedPrompt = useMemo(() => buildPrompt(builder), [builder])

  useEffect(() => {
    if (copyState !== 'idle' && previousPromptRef.current !== generatedPrompt.prompt) {
      setCopyState('idle')
    }

    previousPromptRef.current = generatedPrompt.prompt
  }, [copyState, generatedPrompt.prompt])

  const subjectRules = compatibility.subjectRules[builder.subject] || {}
  const relevantPoses = new Set(subjectRules.relevantPoses || [])
  const relevantOutfits = new Set(subjectRules.relevantOutfits || [])
  const relevantBackgrounds = new Set(subjectRules.recommendedBackgrounds || [])

  const visiblePoses = useMemo(() => {
    const list = poses.filter(
      (option) =>
        option.value === 'none' ||
        relevantPoses.size === 0 ||
        relevantPoses.has(option.value) ||
        option.value === 'standing' ||
        option.value === 'sitting' ||
        option.value === 'looking-at-camera'
    )

    return list
  }, [relevantPoses])

  const visibleOutfits = useMemo(() => {
    const groups = Object.entries(outfits)
      .map(([group, options]) => ({
        group,
        options: options.filter(
          (option) =>
            option.value === 'none' ||
            relevantOutfits.size === 0 ||
            relevantOutfits.has(option.value) ||
            option.value === 'casual' ||
            option.value === 'formal' ||
            option.value === 'traditional' ||
            option.value === 'custom'
        ),
      }))
      .filter((group) => group.options.length)

    return groups
  }, [relevantOutfits])

  const visibleBackgrounds = useMemo(() => {
    const groups = Object.entries(backgrounds)
      .map(([group, options]) => ({
        group,
        options: options.filter(
          (option) =>
            option.value === 'none' ||
            relevantBackgrounds.size === 0 ||
            relevantBackgrounds.has(option.value) ||
            option.value === 'studio'
        ),
      }))
      .filter((group) => group.options.length)

    return groups
  }, [relevantBackgrounds])

  const toggleMultiSelect = (field, value) => {
    setBuilder((current) => {
      const selected = current[field] || []

      if (value === 'none') {
        return { ...current, [field]: selected.includes('none') ? [] : ['none'] }
      }

      const withoutNone = selected.filter((item) => item !== 'none')
      const next = withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
        : [...withoutNone, value]

      return { ...current, [field]: next }
    })
  }

  const updateField = (field, value) => {
    setBuilder((current) => ({ ...current, [field]: value }))
  }

  const handleCopyPrompt = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedPrompt.prompt)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = generatedPrompt.prompt
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
      trackEvent('builder_prompt_copy', {
        subject: builder.subject,
        style: builder.style,
        purpose: builder.purpose,
      })
      window.setTimeout(() => setCopyState('idle'), 1500)
    } catch {
      setCopyState('error')
      window.setTimeout(() => setCopyState('idle'), 1800)
    }
  }

  const handleReset = () => {
    const next = createDefaultBuilderSelections()
    setBuilder(next)
    setCopyState('idle')
    trackEvent('builder_reset', {
      subject: next.subject,
      style: next.style,
    })
  }

  const handleSurpriseMe = () => {
    const next = randomizeBuilderSelections(builder)
    setBuilder(next)
    setCopyState('idle')
    trackEvent('builder_surprise_me', {
      subject: next.subject,
      style: next.style,
      purpose: next.purpose,
    })
  }

  const copyLabel =
    copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy Prompt'

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16 md:py-10">
      <CreateIntro />

      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut', delay: 0.06 }}
        className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-muted)_100%)] p-4 shadow-[0_16px_38px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.08),transparent_28%)]" />

        <div className="relative space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {builderProgress.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold uppercase tracking-[0.14em] ${
                      index === 0
                        ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {step}
                  </span>
                  {index < builderProgress.length - 1 ? (
                    <span className="h-px w-3 bg-[var(--border)]" aria-hidden="true" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Basic Customization
              </p>
              <h2 className="m-0 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)] sm:text-3xl">
                Customize your image
              </h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                <SectionHeader label="Who is this for?" description="Choose the people in the photo." />
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((option) => (
                    <SelectCardButton
                      key={option.value}
                      isSelected={builder.subject === option.value}
                      onClick={() => updateField('subject', option.value)}
                      ariaLabel={`Select subject ${option.label}`}
                    >
                      {subjectLabelMap[option.value] ?? option.label}
                    </SelectCardButton>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                <SectionHeader label="02 — Format" description="Choose where the image will be used." />
                <div className="grid grid-cols-2 gap-2">
                  {purposes.map((option) => (
                    <SelectCardButton
                      key={option.value}
                      isSelected={builder.purpose === option.value}
                      onClick={() => updateField('purpose', option.value)}
                      ariaLabel={`Select purpose ${option.label}`}
                    >
                      <span className="flex flex-col items-center justify-center text-center">
                        <span>{option.label}</span>
                        {option.ratio && option.ratio !== 'custom' ? (
                          <span className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {option.ratio}
                          </span>
                        ) : null}
                      </span>
                    </SelectCardButton>
                  ))}
                </div>

                {builder.purpose === 'custom' ? (
                  <div className="mt-3">
                    <label
                      htmlFor="custom-aspect-ratio"
                      className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    >
                      Custom Aspect Ratio
                    </label>
                    <input
                      id="custom-aspect-ratio"
                      type="text"
                      value={builder.customAspectRatio || ''}
                      onChange={(event) => updateField('customAspectRatio', event.target.value)}
                      placeholder="e.g. 2:3 or 5:4"
                      className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    />
                  </div>
                ) : null}
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                <SectionHeader label="03 — Style & Scene" description="Pick the main creative direction." />
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Style
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {styles.map((option) => (
                        <MultiSelectButton
                          key={option.value}
                          selected={builder.style === option.value}
                          onClick={() => updateField('style', option.value)}
                          ariaLabel={`Select style ${option.label}`}
                        >
                          {option.label}
                        </MultiSelectButton>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                <SectionHeader label="04 — Appearance" description="Choose the scene and outfit details." />
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Background / Location
                    </p>
                    <div className="space-y-3">
                      {visibleBackgrounds.map(({ group, options }) => (
                        <div key={group}>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {group === 'nature'
                              ? 'Nature'
                              : group === 'urban'
                                ? 'Urban'
                                : group === 'travel'
                                  ? 'Travel'
                                  : group === 'special'
                                    ? 'Special / Creative'
                                    : group === 'none'
                                      ? 'None'
                                      : 'Local'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {options.map((option) => (
                              <MultiSelectButton
                                key={option.value}
                                selected={builder.background === option.value}
                                onClick={() => updateField('background', option.value)}
                                ariaLabel={`Set background ${option.label}`}
                              >
                                {option.label}
                              </MultiSelectButton>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Outfit
                    </p>
                    <div className="space-y-3">
                      {visibleOutfits.map(({ group, options }) => (
                        <div key={group}>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {group === 'general'
                              ? 'General'
                              : group === 'desi'
                                ? 'Bangladeshi / Desi'
                                : group === 'none'
                                  ? 'None'
                                  : 'Custom'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {options.map((option) => (
                              <MultiSelectButton
                                key={option.value}
                                selected={builder.outfit === option.value}
                                onClick={() => updateField('outfit', option.value)}
                                ariaLabel={`Set outfit ${option.label}`}
                              >
                                {option.label}
                              </MultiSelectButton>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 xl:col-span-2">
                <SectionHeader label="05 — Mood & Lighting" description="Direct the emotional and visual tone." />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Pose
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {visiblePoses.map((option) => (
                        <MultiSelectButton
                          key={option.value}
                          selected={builder.pose === option.value}
                          onClick={() => updateField('pose', option.value)}
                          ariaLabel={`Set pose ${option.label}`}
                        >
                          {option.label}
                        </MultiSelectButton>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Mood
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((option) => (
                        <MultiSelectButton
                          key={option.value}
                          selected={builder.mood === option.value}
                          onClick={() => updateField('mood', option.value)}
                          ariaLabel={`Set mood ${option.label}`}
                        >
                          {option.label}
                        </MultiSelectButton>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Lighting
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lighting.map((option) => (
                        <MultiSelectButton
                          key={option.value}
                          selected={builder.lighting === option.value}
                          onClick={() => updateField('lighting', option.value)}
                          ariaLabel={`Set lighting ${option.label}`}
                        >
                          {option.label}
                        </MultiSelectButton>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setShowAdvanced((open) => !open)}
                aria-expanded={showAdvanced}
                className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Advanced Customization
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                    Fine-tune the final look
                  </h3>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)]">
                  {showAdvanced ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {showAdvanced ? (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, height: 'auto' }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <div className="space-y-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Expression
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {expressions.map((option) => (
                              <MultiSelectButton
                                key={option.value}
                                selected={builder.expression === option.value}
                                onClick={() => updateField('expression', option.value)}
                                ariaLabel={`Set expression ${option.label}`}
                              >
                                {option.label}
                              </MultiSelectButton>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Time
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {timeOptions.map((option) => (
                              <MultiSelectButton
                                key={option.value}
                                selected={builder.time === option.value}
                                onClick={() => updateField('time', option.value)}
                                ariaLabel={`Set time ${option.label}`}
                              >
                                {option.label}
                              </MultiSelectButton>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Weather
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {weather.map((option) => (
                              <MultiSelectButton
                                key={option.value}
                                selected={builder.weather === option.value}
                                onClick={() => updateField('weather', option.value)}
                                ariaLabel={`Set weather ${option.label}`}
                              >
                                {option.label}
                              </MultiSelectButton>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Color Grading
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {colorGrading.map((option) => (
                              <MultiSelectButton
                                key={option.value}
                                selected={builder.colorGrading === option.value}
                                onClick={() => updateField('colorGrading', option.value)}
                                ariaLabel={`Set color grading ${option.label}`}
                              >
                                {option.label}
                              </MultiSelectButton>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Cultural / Regional
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cultural.map((option) => (
                              <MultiSelectButton
                                key={option.value}
                                selected={builder.cultural === option.value}
                                onClick={() => updateField('cultural', option.value)}
                                ariaLabel={`Set cultural ${option.label}`}
                              >
                                {option.label}
                              </MultiSelectButton>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 xl:col-span-2">
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Camera / Photography
                          </p>
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Camera
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cameraSettings.camera.map((option) => (
                                  <MultiSelectButton
                                    key={option.value}
                                    selected={builder.camera === option.value}
                                    onClick={() => updateField('camera', option.value)}
                                    ariaLabel={`Set camera ${option.label}`}
                                  >
                                    {option.label}
                                  </MultiSelectButton>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Lens
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cameraSettings.lens.map((option) => (
                                  <MultiSelectButton
                                    key={option.value}
                                    selected={builder.lens === option.value}
                                    onClick={() => updateField('lens', option.value)}
                                    ariaLabel={`Set lens ${option.label}`}
                                  >
                                    {option.label}
                                  </MultiSelectButton>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Framing
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cameraSettings.framing.map((option) => (
                                  <MultiSelectButton
                                    key={option.value}
                                    selected={builder.framing === option.value}
                                    onClick={() => updateField('framing', option.value)}
                                    ariaLabel={`Set framing ${option.label}`}
                                  >
                                    {option.label}
                                  </MultiSelectButton>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                Style
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cameraSettings.photographyStyle.map((option) => (
                                  <MultiSelectButton
                                    key={option.value}
                                    selected={builder.photographyStyle === option.value}
                                    onClick={() => updateField('photographyStyle', option.value)}
                                    ariaLabel={`Set photography style ${option.label}`}
                                  >
                                    {option.label}
                                  </MultiSelectButton>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                              Accessories
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {accessories.map((option) => (
                                <MultiSelectButton
                                  key={option.value}
                                  selected={(builder.accessories || []).includes(option.value)}
                                  onClick={() => toggleMultiSelect('accessories', option.value)}
                                  ariaLabel={`Toggle accessory ${option.label}`}
                                >
                                  {option.label}
                                </MultiSelectButton>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                              Effects
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {effects.map((option) => (
                                <MultiSelectButton
                                  key={option.value}
                                  selected={(builder.effects || []).includes(option.value)}
                                  onClick={() => toggleMultiSelect('effects', option.value)}
                                  ariaLabel={`Toggle effect ${option.label}`}
                                >
                                  {option.label}
                                </MultiSelectButton>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              aria-pressed={builder.identityPreservation}
                              onClick={() => updateField('identityPreservation', !builder.identityPreservation)}
                              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                                builder.identityPreservation
                                  ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)]'
                                  : 'border-[var(--border)] bg-[var(--surface)] text-transparent'
                              }`}
                            >
                              {builder.identityPreservation ? <Check className="size-3.5" aria-hidden="true" /> : null}
                            </button>
                            <div>
                              <p className="text-sm font-semibold text-[var(--text)]">Preserve my real identity</p>
                              <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                Keep facial structure, features, skin tone, age, and recognizable appearance consistent with the uploaded photo.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="custom-instruction" className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Custom Instruction
                          </label>
                          <textarea
                            id="custom-instruction"
                            value={builder.customInstruction}
                            onChange={(event) => updateField('customInstruction', event.target.value)}
                            placeholder="Add anything specific you want in the final image..."
                            className="min-h-[110px] w-full resize-y rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2"
                aria-label="Reset builder selections"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Start Over
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleSurpriseMe}
                className="inline-flex items-center justify-center gap-2"
                aria-label="Generate a surprising compatible builder configuration"
              >
                <Shuffle className="size-3.5" aria-hidden="true" />
                Surprise Me
              </Button>
            </div>

            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <Camera className="size-3.5" aria-hidden="true" />
                  Prompt Preview
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyPrompt}
                    className={`inline-flex items-center gap-2 ${
                      copyState === 'success'
                        ? 'border-[var(--success)] bg-[var(--success)] text-[var(--background)] hover:-translate-y-0'
                        : copyState === 'error'
                          ? 'border-[var(--error)] text-[var(--error)]'
                          : ''
                    }`}
                    aria-live="polite"
                    aria-label={copyLabel}
                  >
                    {copyState === 'success' ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                    {copyLabel}
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                    {generatedPrompt.metadata.subject}
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                    {generatedPrompt.metadata.style}
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                    {generatedPrompt.metadata.purpose}
                  </span>
                </div>

                <div className="max-h-[290px] overflow-y-auto overscroll-contain rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm leading-7 text-[var(--text)] [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] sm:text-[15px] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-track]:bg-transparent">
                  <p className="m-0 whitespace-pre-wrap break-words">{generatedPrompt.prompt}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-muted)_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="mb-3 flex items-center gap-3 text-[var(--text)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--brand-soft)] text-[var(--text)]">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Ready to Create?
                </p>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[9px] text-[var(--text)]">
                      {String(step).padStart(2, '0')}
                    </span>
                    <span>
                      {step === 1
                        ? 'Copy'
                        : step === 2
                          ? 'Upload'
                          : step === 3
                            ? 'Paste'
                            : 'Generate'}
                    </span>
                    {step < 4 ? <span className="h-px w-3 bg-[var(--border)]" aria-hidden="true" /> : null}
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <a
                  href="https://chatgpt.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('builder_create_chatgpt', { subject: builder.subject, style: builder.style })}
                  aria-label="Create with ChatGPT opens in a new tab"
                  className="group flex min-h-[52px] items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(113,79,246,0.08),rgba(255,255,255,0.02))] px-4 py-3 text-left text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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
                  onClick={() => trackEvent('builder_create_gemini', { subject: builder.subject, style: builder.style })}
                  aria-label="Create with Gemini opens in a new tab"
                  className="group flex min-h-[52px] items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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

              <div className="mt-4">
                <p className="m-0 text-[11px] leading-5 text-[var(--text-muted)] sm:text-xs">
                  Copy the prompt → Open an AI tool → Upload your photo → Paste the prompt → Generate
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default CreatePage
