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
} from 'lucide-react'
import {
  accessories,
  appearanceBackgroundsBySubject,
  cameraSettings,
  colorGrading,
  compatibility,
  cultural,
  effects,
  expressions,
  garmentOptions,
  garmentOptionsBySubject,
  identityPreservation,
  lighting,
  moods,
  outfitColorGroups,
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

const backgroundGroupLabels = {
  nature: 'Nature',
  urban: 'Urban',
  travel: 'Travel',
  special: 'Special / Creative',
  local: 'Local',
  none: 'None',
}

const garmentGroupLabels = {
  upper: 'Upper',
  outerwear: 'Outerwear',
  lower: 'Lower',
  traditionalLower: 'Traditional Lower',
  footwear: 'Footwear',
  accessories: 'Accessories',
  womenUpper: 'Upper',
  womenTraditional: 'Traditional / One-piece',
  womenLower: 'Lower',
  womenOuterwear: 'Outerwear',
  womenFootwear: 'Footwear',
  womenAccessories: 'Accessories',
  kidsUpper: 'Upper',
  kidsTraditional: 'Traditional / One-piece',
  kidsLower: 'Lower',
  kidsOuterwear: 'Outerwear',
  kidsFootwear: 'Footwear',
  kidsAccessories: 'Accessories',
  boysClothingUpper: 'Upper',
  boysClothingTraditional: 'Traditional / One-piece',
  boysClothingLower: 'Lower',
  boysClothingOuterwear: 'Outerwear',
  boysClothingFootwear: 'Footwear',
  boysClothingAccessories: 'Accessories',
  girlsClothingUpper: 'Upper',
  girlsClothingTraditional: 'Traditional / One-piece',
  girlsClothingLower: 'Lower',
  girlsClothingOuterwear: 'Outerwear',
  girlsClothingFootwear: 'Footwear',
  girlsClothingAccessories: 'Accessories',
}

const garmentPersonSectionLabels = {
  men: 'Men',
  women: 'Women',
  kids: 'Kids',
  boysClothing: "Boys' Clothing",
  girlsClothing: "Girls' Clothing",
}

const personCustomFields = {
  men: { item: 'customGarmentsMen', color: 'customGarmentColorMen' },
  women: { item: 'customGarmentsWomen', color: 'customGarmentColorWomen' },
  kids: { item: 'customGarmentsKids', color: 'customGarmentColorKids' },
  boysClothing: { item: 'customGarmentsBoysClothing', color: 'customGarmentColorBoysClothing' },
  girlsClothing: { item: 'customGarmentsGirlsClothing', color: 'customGarmentColorGirlsClothing' },
}

// Mirrors the garment -> color-palette relationship already used by the prompt engine,
// so the UI only offers colors that the selected garment accepts.
const garmentColorGroupKeys = {
  upper: ['upper'],
  outerwear: ['upper'],
  lower: ['lower'],
  traditionalLower: ['traditionalLower'],
  footwear: ['lower'],
  accessories: ['upper', 'lower'],
  womenUpper: ['upper'],
  womenTraditional: ['upper', 'traditionalLower'],
  womenLower: ['lower'],
  womenOuterwear: ['upper'],
  womenFootwear: ['lower'],
  womenAccessories: ['upper', 'lower'],
  kidsUpper: ['upper'],
  kidsTraditional: ['upper', 'traditionalLower'],
  kidsLower: ['lower'],
  kidsOuterwear: ['upper'],
  kidsFootwear: ['lower'],
  kidsAccessories: ['upper', 'lower'],
  boysClothingUpper: ['upper'],
  boysClothingTraditional: ['upper', 'traditionalLower'],
  boysClothingLower: ['lower'],
  boysClothingOuterwear: ['upper'],
  boysClothingFootwear: ['lower'],
  boysClothingAccessories: ['upper', 'lower'],
  girlsClothingUpper: ['upper'],
  girlsClothingTraditional: ['upper', 'traditionalLower'],
  girlsClothingLower: ['lower'],
  girlsClothingOuterwear: ['upper'],
  girlsClothingFootwear: ['lower'],
  girlsClothingAccessories: ['upper', 'lower'],
}

const garmentGroupByValue = Object.entries(garmentOptions).reduce((acc, [group, options]) => {
  options.forEach((option) => {
    acc[option.value] = group
  })

  return acc
}, {})

const garmentLabelByValue = Object.values(garmentOptions)
  .flat()
  .reduce((acc, option) => {
    acc[option.value] = option.label
    return acc
  }, {})

const getGarmentColorOptions = (garmentValue) => {
  const keys = garmentColorGroupKeys[garmentGroupByValue[garmentValue]] || []
  const seen = new Set()

  return keys
    .flatMap((key) => outfitColorGroups[key] || [])
    .filter((color) => {
      if (seen.has(color.value)) return false
      seen.add(color.value)
      return true
    })
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

function CustomField({ id, field, value, placeholder, label = 'Custom', onChange }) {
  return (
    <div className="mt-3">
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value || ''}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      />
    </div>
  )
}

function CreateIntro() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="mb-8 max-md:transform-none!"
    >
      <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
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
    const subjectOptions = appearanceBackgroundsBySubject[builder.subject] || []
    const grouped = new Map()

    subjectOptions.forEach((option) => {
      const group = option.group || 'nature'
      if (!grouped.has(group)) grouped.set(group, [])
      grouped.get(group).push(option)
    })

    grouped.set('none', [{ value: 'none', label: 'None' }])

    return Array.from(grouped, ([group, options]) => ({ group, options }))
  }, [builder.subject])

  // Only real garments coming from garmentOptions, never the `none` marker.
  const selectedGarments = useMemo(
    () =>
      (builder.outfitGarments || []).filter(
        (garment) => garment !== 'none' && Boolean(garmentGroupByValue[garment])
      ),
    [builder.outfitGarments]
  )

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

  // Garment multi-select. `none` stays mutually exclusive with real garments and
  // dropping a garment also drops its color so outfitColors never keeps stale keys.
  // For multi-person subjects, `none:<person>` clears only that person's garments;
  // the global `none` keeps the legacy single-person behavior.
  const toggleGarment = (garment, person = null) => {
    setBuilder((current) => {
      const selected = current.outfitGarments || []

      if (garment === 'none' && !person) {
        return selected.includes('none')
          ? { ...current, outfitGarments: [] }
          : { ...current, outfitGarments: ['none'], outfitColors: {} }
      }

      if (person) {
        const personGarments = new Set(
          Object.values(garmentOptionsBySubject[current.subject]?.[person] || {})
            .flat()
            .map((option) => option.value)
        )
        const nextGarments = selected.filter(
          (item) => item === 'none' || !personGarments.has(item)
        )
        const fields = personCustomFields[person]
        const next = { ...current, outfitGarments: nextGarments }
        const nextColors = { ...(current.outfitColors || {}) }
        personGarments.forEach((value) => {
          delete nextColors[value]
        })
        next.outfitColors = nextColors
        if (fields) {
          next[fields.item] = ''
          next[fields.color] = ''
        }

        return next
      }

      const withoutNone = selected.filter((item) => item !== 'none')

      if (withoutNone.includes(garment)) {
        const nextColors = { ...(current.outfitColors || {}) }
        delete nextColors[garment]

        return {
          ...current,
          outfitGarments: withoutNone.filter((item) => item !== garment),
          outfitColors: nextColors,
        }
      }

      return { ...current, outfitGarments: [...withoutNone, garment] }
    })
  }

  const updateGarmentColor = (garment, colorValue) => {
    setBuilder((current) => {
      const selected = current.outfitGarments || []
      if (garment === 'none' || !selected.includes(garment)) return current

      const nextColors = { ...(current.outfitColors || {}) }

      if (colorValue) {
        nextColors[garment] = colorValue
      } else {
        delete nextColors[garment]
      }

      return { ...current, outfitColors: nextColors }
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
        className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-muted)_100%)] p-4 shadow-[0_16px_38px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8 max-md:transform-none!"
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
                <CustomField
                  id="custom-purpose"
                  field="customPurpose"
                  value={builder.customPurpose}
                  placeholder="Other composition direction..."
                  onChange={updateField}
                />
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
                    <CustomField
                      id="custom-style"
                      field="customStyle"
                      value={builder.customStyle}
                      placeholder="Other style..."
                      onChange={updateField}
                    />
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
                            {backgroundGroupLabels[group] ?? 'Local'}
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
                    <CustomField
                      id="custom-background"
                      field="customBackground"
                      value={builder.customBackground}
                      placeholder="Other background / location..."
                      onChange={updateField}
                    />
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
                    <CustomField
                      id="custom-outfit"
                      field="customOutfit"
                      value={builder.customOutfit}
                      placeholder="Other outfit..."
                      label="Other"
                      onChange={updateField}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Specific Clothing
                    </p>
                    <div className="space-y-4">
                      {(() => {
                        const subjectGarments = garmentOptionsBySubject[builder.subject] || { men: garmentOptions }
                        const personEntries = Object.entries(subjectGarments)
                        const showPersonHeaders = personEntries.length > 1

                        const blocks = personEntries.map(([person, groups]) => (
                          <div key={person} className="space-y-3">
                            {showPersonHeaders ? (
                              <p className="border-b border-[var(--border)] pb-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text)]">
                                {garmentPersonSectionLabels[person] ?? person}
                              </p>
                            ) : null}

                            {Object.entries(groups).map(([group, options]) => (
                              <div key={group}>
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                  {garmentGroupLabels[group] ?? group}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {options.map((option) => (
                                    <MultiSelectButton
                                      key={option.value}
                                      selected={(builder.outfitGarments || []).includes(option.value)}
                                      onClick={() => toggleGarment(option.value)}
                                      ariaLabel={`Toggle clothing ${option.label}`}
                                    >
                                      {option.label}
                                    </MultiSelectButton>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {showPersonHeaders ? (
                              <div>
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                  {`${garmentPersonSectionLabels[person] ?? person} — None`}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <MultiSelectButton
                                    selected={Object.values(subjectGarments[person] || {})
                                      .flat()
                                      .every(
                                        (option) =>
                                          !(builder.outfitGarments || []).includes(option.value),
                                      )}
                                    onClick={() => toggleGarment('__person-none__', person)}
                                    ariaLabel={`Clear ${garmentPersonSectionLabels[person] ?? person} clothing selection`}
                                  >
                                    None
                                  </MultiSelectButton>
                                </div>
                              </div>
                            ) : null}

                            {showPersonHeaders && personCustomFields[person] ? (
                              <>
                                <CustomField
                                  id={`custom-garments-${person}`}
                                  field={personCustomFields[person].item}
                                  value={builder[personCustomFields[person].item]}
                                  placeholder="Other clothing item..."
                                  label={`${garmentPersonSectionLabels[person] ?? person} Custom Clothing`}
                                  onChange={updateField}
                                />
                                <CustomField
                                  id={`custom-garment-color-${person}`}
                                  field={personCustomFields[person].color}
                                  value={builder[personCustomFields[person].color]}
                                  placeholder="Other clothing color..."
                                  label={`${garmentPersonSectionLabels[person] ?? person} Custom Clothing Color`}
                                  onChange={updateField}
                                />
                              </>
                            ) : null}
                          </div>
                        ))
                        // Family groups boys/girls clothing under a shared Kids parent.
                        const kidsBlock =
                          builder.subject !== 'family' ? null : (
                            <div key="kids" className="space-y-3">
                              <p className="border-b border-[var(--border)] pb-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text)]">
                                Kids
                              </p>
                              <div className="space-y-4 border-l-2 border-[var(--border)] pl-3">
                                {blocks.filter(
                                  (block) =>
                                    block.key === 'boysClothing' || block.key === 'girlsClothing',
                                )}
                              </div>
                            </div>
                          )

                        return builder.subject === 'family' && kidsBlock
                          ? [
                              ...blocks.filter(
                                (block) =>
                                  block.key !== 'boysClothing' && block.key !== 'girlsClothing',
                              ),
                              kidsBlock,
                            ]
                          : blocks
                      })()}

                      {builder.subject === 'couples' || builder.subject === 'family' ? null : (
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            None
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <MultiSelectButton
                              selected={(builder.outfitGarments || []).includes('none')}
                              onClick={() => toggleGarment('none')}
                              ariaLabel="Clear specific clothing selection"
                            >
                              None
                            </MultiSelectButton>
                          </div>
                        </div>
                      )}
                    </div>

                    {builder.subject === 'couples' || builder.subject === 'family' ? null : (
                      <CustomField
                        id="custom-garments"
                        field="customGarments"
                        value={builder.customGarments}
                        placeholder="Other clothing item..."
                        label="Custom Clothing"
                        onChange={updateField}
                      />
                    )}

                    {selectedGarments.length ? (
                      <div className="mt-4 space-y-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          Clothing Color
                        </p>
                        {selectedGarments.map((garment) => (
                          <div key={garment}>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                              {garmentLabelByValue[garment] ?? garment}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <MultiSelectButton
                                selected={!(builder.outfitColors || {})[garment]}
                                onClick={() => updateGarmentColor(garment, null)}
                                ariaLabel={`Clear color for ${garmentLabelByValue[garment] ?? garment}`}
                              >
                                No Color
                              </MultiSelectButton>
                              {getGarmentColorOptions(garment).map((color) => (
                                <MultiSelectButton
                                  key={color.value}
                                  selected={(builder.outfitColors || {})[garment] === color.value}
                                  onClick={() => updateGarmentColor(garment, color.value)}
                                  ariaLabel={`Set ${garmentLabelByValue[garment] ?? garment} color ${color.label}`}
                                >
                                  {color.label}
                                </MultiSelectButton>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {builder.subject === 'couples' || builder.subject === 'family' ? null : (
                      <CustomField
                        id="custom-garment-color"
                        field="customGarmentColor"
                        value={builder.customGarmentColor}
                        placeholder="Other clothing color..."
                        label="Custom Clothing Color"
                        onChange={updateField}
                      />
                    )}
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
                    <CustomField
                      id="custom-pose"
                      field="customPose"
                      value={builder.customPose}
                      placeholder="Other pose..."
                      onChange={updateField}
                    />
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
                    <CustomField
                      id="custom-mood"
                      field="customMood"
                      value={builder.customMood}
                      placeholder="Other mood..."
                      onChange={updateField}
                    />
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
                    <CustomField
                      id="custom-lighting"
                      field="customLighting"
                      value={builder.customLighting}
                      placeholder="Other lighting..."
                      onChange={updateField}
                    />
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
                          <CustomField
                            id="custom-expression"
                            field="customExpression"
                            value={builder.customExpression}
                            placeholder="Other expression..."
                            onChange={updateField}
                          />
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
                          <CustomField
                            id="custom-time"
                            field="customTime"
                            value={builder.customTime}
                            placeholder="Other time..."
                            onChange={updateField}
                          />
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
                          <CustomField
                            id="custom-weather"
                            field="customWeather"
                            value={builder.customWeather}
                            placeholder="Other weather..."
                            onChange={updateField}
                          />
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
                          <CustomField
                            id="custom-color-grading"
                            field="customColorGrading"
                            value={builder.customColorGrading}
                            placeholder="Other color grading..."
                            onChange={updateField}
                          />
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
                          <CustomField
                            id="custom-cultural"
                            field="customCultural"
                            value={builder.customCultural}
                            placeholder="Other cultural detail..."
                            onChange={updateField}
                          />
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
                          <CustomField
                            id="custom-camera"
                            field="customCamera"
                            value={builder.customCamera}
                            placeholder="Other camera / photography..."
                            onChange={updateField}
                          />
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
                            <CustomField
                              id="custom-accessories"
                              field="customAccessories"
                              value={builder.customAccessories}
                              placeholder="Other accessory..."
                              onChange={updateField}
                            />
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
                            <CustomField
                              id="custom-effects"
                              field="customEffects"
                              value={builder.customEffects}
                              placeholder="Other effect..."
                              onChange={updateField}
                            />
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
