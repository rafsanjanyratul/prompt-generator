import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowUpRight,
  AudioLines,
  Check,
  Copy,
  Mic,
  Sparkles,
  Square,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { createUserPrompt } from '../lib/authApi.js'
import { trackEvent } from '../lib/analytics.js'

const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: 'English' },
  { value: 'bn-BD', label: 'বাংলা' },
]

const READY_STEPS = ['Copy', 'Upload', 'Paste', 'Generate']

const UNSUPPORTED_MESSAGE =
  'Speech recognition isn’t supported in this browser. You can still type your prompt below and use the Ready to Create section.'

function getSpeechRecognition() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function describeSpeechError(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was blocked. Allow microphone permission for this site in your browser settings and try again.'
    case 'audio-capture':
      return 'No microphone was detected. Connect a microphone and try again.'
    case 'network':
      return 'Speech recognition needs a network connection. Check your connection and try again.'
    case 'language-not-supported':
      return 'This speech language isn’t supported by your browser. Try switching to English.'
    default:
      return 'Something went wrong while listening. Please try again.'
  }
}

async function writeToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
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

function normalizeForComparison(text) {
  // Comparison-only normalization: case/punctuation/whitespace drift between
  // redelivered results must not defeat duplicate detection. Unicode marks
  // (e.g. Bengali vowel signs) are preserved so words are never corrupted.
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordsOf(normalizedText) {
  return normalizedText.split(' ').filter(Boolean)
}

function stripLeadingEcho(echoTail, candidateKey, candidateText) {
  // One-shot guard for the automatic-restart echo: the first final of the new
  // run often repeats the already committed tail. Strip that leading overlap
  // (word-aligned) so the echo is not appended a second time.
  const tailWords = wordsOf(echoTail)
  const candidateWords = wordsOf(candidateKey)
  const rawWords = candidateText.split(/\s+/).filter(Boolean)
  if (!tailWords.length || !candidateWords.length) {
    return { key: candidateKey, text: candidateText }
  }

  let overlap = 0
  const maxOverlap = Math.min(tailWords.length, candidateWords.length)
  for (let size = maxOverlap; size > 0; size -= 1) {
    const tailSlice = tailWords.slice(tailWords.length - size).join(' ')
    const candidateSlice = candidateWords.slice(0, size).join(' ')
    if (tailSlice === candidateSlice) {
      overlap = size
      break
    }
  }

  if (overlap === 0) return { key: candidateKey, text: candidateText }
  const remainingRaw = rawWords.slice(overlap).join(' ')
  const remainingKey = candidateWords.slice(overlap).join(' ')
  return { key: remainingKey, text: remainingRaw }
}

function VoicePromptPage() {
  const prefersReducedMotion = useReducedMotion()
  const { user } = useAuth()
  const speechRecognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), [])
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value)
  const [promptText, setPromptText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [speechCopyState, setSpeechCopyState] = useState('idle')
  const [promptCopyState, setPromptCopyState] = useState('idle')
  const [isSavingPrompt, setIsSavingPrompt] = useState(false)
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' })
  const [savedPromptId, setSavedPromptId] = useState(null)
  const lastSavedSignatureRef = useRef('')

  const recognitionRef = useRef(null)
  const keepListeningRef = useRef(false)
  const sessionIdRef = useRef(0)
  const committedTextRef = useRef('')
  const sessionFinalRef = useRef('')
  const lastInterimRef = useRef('')
  const runFinalsRef = useRef([])
  const runMaxIndexRef = useRef(-1)
  const overlapTailRef = useRef('')
  const restartTimerRef = useRef(0)

  const renderTranscript = () => {
    // Single render path: committed text + finalized words for this session.
    // Interim text is intentionally not stored in state; it is rendered only
    // from the latest onresult event so repeated interim callbacks replace,
    // never append.
    setPromptText(`${committedTextRef.current}${sessionFinalRef.current}${lastInterimRef.current}`)
  }

  const detachRecognition = (recognition) => {
    if (!recognition) return
    recognition.onstart = null
    recognition.onresult = null
    recognition.onerror = null
    recognition.onend = null
  }

  const clearRestartTimer = () => {
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = 0
    }
  }

  const rebuildRunDisplay = () => {
    // Authoritative per-run rebuild: committed words plus the accepted finals
    // of the current recognition run. Replaying the same event is idempotent
    // because display derives from the accepted list, never from appends.
    const sessionText = runFinalsRef.current
      .map((entry) => entry.display)
      .join(' ')
    const combined = [committedTextRef.current.trim(), sessionText.trim()]
      .filter(Boolean)
      .join(' ')
    sessionFinalRef.current = sessionText ? `${sessionText} ` : ''
    return combined ? `${combined} ` : ''
  }

  const resetSessionBuffers = (baseText) => {
    committedTextRef.current = baseText
    sessionFinalRef.current = ''
    lastInterimRef.current = ''
    runFinalsRef.current = []
    runMaxIndexRef.current = -1
    overlapTailRef.current = ''
  }

  const commitSessionFinal = () => {
    committedTextRef.current = rebuildRunDisplay()
    sessionFinalRef.current = ''
    lastInterimRef.current = ''
    runFinalsRef.current = []
    runMaxIndexRef.current = -1
    overlapTailRef.current = ''
  }

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current
      sessionIdRef.current += 1
      keepListeningRef.current = false
      recognitionRef.current = null
      lastInterimRef.current = ''
      clearRestartTimer()
      detachRecognition(recognition)

      if (!recognition) return

      try {
        recognition.abort()
      } catch {
        // Microphone teardown should never break navigation.
      }
    }
  }, [])

  useDocumentMeta({
    title: 'Voice Prompt',
    description: 'Speak your idea and turn it into a ready-to-use AI image prompt.',
  })

  const startListening = (nextLanguage) => {
    const SpeechRecognitionCtor = getSpeechRecognition()

    if (!SpeechRecognitionCtor) {
      setStatusMessage(UNSUPPORTED_MESSAGE)
      return
    }

    // Handoff: preserve the currently committed text as the new base, then
    // invalidate stale events from the previous instance via session id +
    // detached handlers. In-flight interim/final buffers are intentionally
    // NOT carried across: on mobile the previous instance can redeliver them
    // after a restart, which appended the same phrase 5-6 times.
    const preserved = committedTextRef.current
    const previous = recognitionRef.current
    sessionIdRef.current += 1
    keepListeningRef.current = false
    clearRestartTimer()
    detachRecognition(previous)
    if (previous) {
      try {
        previous.abort()
      } catch {
        // Ignore abort failures and continue with the new session.
      }
      if (recognitionRef.current === previous) {
        recognitionRef.current = null
      }
    }

    const sessionId = sessionIdRef.current + 1
    sessionIdRef.current = sessionId

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = nextLanguage
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    committedTextRef.current = preserved
    resetSessionBuffers(preserved)

    recognition.onstart = () => {
      if (sessionIdRef.current !== sessionId) return
      setIsListening(true)
      setStatusMessage('')
    }

    recognition.onresult = (event) => {
      // Drop late events from an aborted instance (common on low-end mobile).
      if (sessionIdRef.current !== sessionId) return
      if (recognitionRef.current !== recognition) return

      let interimTranscript = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const display = (result?.[0]?.transcript ?? '').trim()
        if (!display) continue
        const comparisonKey = normalizeForComparison(display)

        if (!result.isFinal) {
          // Interim is temporary: rebuild from this event only (replace).
          // Never compare interim against committed text: while the user
          // keeps talking, interim legitimately extends the accepted words.
          interimTranscript += result[0].transcript
          continue
        }

        // New recognition run after an automatic restart: resultIndex resets
        // toward zero and mobile replays the previous utterance. Fold the run
        // into committed text ONCE, keep it as the one-shot overlap tail, and
        // start a fresh run list — without clearing the tail, the same replay
        // would be compared against an empty run and appended again.
        if (index <= runMaxIndexRef.current) {
          committedTextRef.current = rebuildRunDisplay()
          overlapTailRef.current = normalizeForComparison(
            `${committedTextRef.current} ${sessionFinalRef.current}`,
          )
          runFinalsRef.current = []
          runMaxIndexRef.current = -1
          lastInterimRef.current = ''
        }

        const existing = runFinalsRef.current.find((entry) => entry.index === index)
        if (existing) {
          if (existing.key === comparisonKey) continue
          // Same slot corrected (e.g. "photo" -> "photos"): replace wording.
          existing.key = comparisonKey
          existing.display = display
        } else {
          let nextDisplay = display
          let nextKey = comparisonKey
          if (overlapTailRef.current) {
            const stripped = stripLeadingEcho(overlapTailRef.current, comparisonKey, display)
            nextDisplay = stripped.text
            nextKey = stripped.key
            // One-shot: an intentional repeat spoken after the echo must be
            // accepted, so disarm after the first final of the new run.
            overlapTailRef.current = ''
          }
          if (!nextDisplay.trim()) continue
          runFinalsRef.current.push({ index, key: nextKey, display: nextDisplay })
        }

        runMaxIndexRef.current = Math.max(runMaxIndexRef.current, index)
        lastInterimRef.current = ''
        setPromptText(`${rebuildRunDisplay()}${lastInterimRef.current}`)
      }

      lastInterimRef.current = interimTranscript
      renderTranscript()
      setSpeechCopyState('idle')
      setPromptCopyState('idle')
    }

    recognition.onerror = (event) => {
      if (sessionIdRef.current !== sessionId) return
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Benign: the session simply continues or restarts on the next result.
        return
      }

      keepListeningRef.current = false
      clearRestartTimer()
      setIsListening(false)
      setStatusMessage(describeSpeechError(event.error))
    }

    recognition.onend = () => {
      if (sessionIdRef.current !== sessionId) return
      // Browsers end long continuous sessions on their own; keep the mic
      // alive until the user stops.
      if (keepListeningRef.current) {
        // Session ended on its own: fold the accepted run into committed text
        // ONCE and keep it as the one-shot overlap tail. The restarted run
        // often replays the tail as its first final; the echo guard strips
        // that replay instead of appending it again.
        committedTextRef.current = rebuildRunDisplay()
        overlapTailRef.current = normalizeForComparison(committedTextRef.current)
        runFinalsRef.current = []
        runMaxIndexRef.current = -1
        lastInterimRef.current = ''
        setPromptText(committedTextRef.current)
        clearRestartTimer()
        // Short, responsive delay only: avoids sync start() inside onend
        // (rejected on some mobile browsers) without a long pause.
        restartTimerRef.current = window.setTimeout(() => {
          restartTimerRef.current = 0
          if (!keepListeningRef.current) return
          if (sessionIdRef.current !== sessionId) return
          if (recognitionRef.current !== recognition) return
          try {
            recognition.start()
          } catch {
            keepListeningRef.current = false
            if (recognitionRef.current === recognition) {
              recognitionRef.current = null
            }
            setIsListening(false)
            setStatusMessage('The microphone could not start. Please try again.')
          }
        }, 120)
        return
      }

      // User stopped: drop unfinalized interim, keep finals, detach handler.
      lastInterimRef.current = ''
      commitSessionFinal()
      setPromptText(committedTextRef.current)
      detachRecognition(recognition)
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition
    keepListeningRef.current = true

    try {
      recognition.start()
    } catch {
      keepListeningRef.current = false
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
      }
      sessionIdRef.current += 1
      setIsListening(false)
      setStatusMessage('The microphone could not start. Please try again.')
    }
  }

  const stopListening = () => {
    keepListeningRef.current = false
    clearRestartTimer()
    const recognition = recognitionRef.current

    // Keep the session id valid so trailing finals delivered after stop()
    // are still accepted; onend finalizes and detaches the handler.
    // Strip unfinalized interim text immediately for responsiveness.
    lastInterimRef.current = ''
    renderTranscript()

    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // A failed stop still resolves through the recognition end handler.
      }
    }

    setIsListening(false)
  }
  const handleToggleRecording = () => {
    if (isListening) {
      stopListening()
      trackEvent('voice_prompt_stop_recording', { language })
      return
    }

    if (!speechRecognitionSupported) {
      setStatusMessage(UNSUPPORTED_MESSAGE)
      return
    }

    setStatusMessage('')
    setSpeechCopyState('idle')
    setPromptCopyState('idle')
    trackEvent('voice_prompt_start_recording', { language })
    startListening(language)
  }

  const handleLanguageChange = (nextLanguage) => {
    if (nextLanguage === language) return

    setLanguage(nextLanguage)
    setStatusMessage('')
    trackEvent('voice_prompt_language_change', { language: nextLanguage })

    if (isListening) {
      startListening(nextLanguage)
    }
  }

  const handlePromptChange = (event) => {
    const value = event.target.value

    setPromptText(value)
    setSpeechCopyState('idle')
    setPromptCopyState('idle')
    // Manual edits become the new base so ongoing speech keeps appending after them.
    committedTextRef.current = value.trim() ? `${value.trim()} ` : ''
    sessionFinalRef.current = ''
    lastInterimRef.current = ''
    runFinalsRef.current = []
    runMaxIndexRef.current = -1
    overlapTailRef.current = ''
  }

  const handleClear = () => {
    // Invalidate the session so no late event from the stopped instance can
    // repopulate the cleared transcript; stopListening's render pass would
    // otherwise race against this clear on mobile.
    sessionIdRef.current += 1
    keepListeningRef.current = false
    clearRestartTimer()
    const recognition = recognitionRef.current
    detachRecognition(recognition)
    if (recognition) {
      try {
        recognition.abort()
      } catch {
        // Clearing must succeed even if the mic teardown fails.
      }
    }
    recognitionRef.current = null
    committedTextRef.current = ''
    sessionFinalRef.current = ''
    lastInterimRef.current = ''
    runFinalsRef.current = []
    runMaxIndexRef.current = -1
    overlapTailRef.current = ''
    setIsListening(false)
    setPromptText('')
    setStatusMessage('')
    setSpeechCopyState('idle')
    setPromptCopyState('idle')
    trackEvent('voice_prompt_clear', { language })
  }

  const handleCopySpeechText = async () => {
    if (!promptText.trim()) return

    try {
      await writeToClipboard(promptText)
      setSpeechCopyState('success')
      toast.success('Transcript copied to clipboard.')
      trackEvent('voice_prompt_copy_transcript', { language })
      window.setTimeout(() => setSpeechCopyState('idle'), 1600)
    } catch {
      setSpeechCopyState('error')
      toast.error('Unable to copy the transcript right now.')
      window.setTimeout(() => setSpeechCopyState('idle'), 1800)
    }
  }

  const copyPromptForAiTool = () => {
    // Copy first, then the card's own href opens the AI tool in a new tab.
    writeToClipboard(promptText)
      .then(() => {
        setPromptCopyState('success')
        toast.success('Prompt copied to clipboard.')
        window.setTimeout(() => setPromptCopyState('idle'), 2600)
      })
      .catch(() => {
        setPromptCopyState('error')
        toast.error('Unable to copy this prompt right now.')
        window.setTimeout(() => setPromptCopyState('idle'), 2800)
      })
  }

  const handleCreateWith = (tool, event) => {
    if (!hasPrompt) {
      event.preventDefault()
      return
    }

    copyPromptForAiTool()
    trackEvent('voice_prompt_copy_prompt', { language, destination: tool })
    trackEvent(tool === 'chatgpt' ? 'voice_prompt_create_chatgpt' : 'voice_prompt_create_gemini', { language })
  }

  const buildVoicePromptPayload = () => {
    const trimmedPrompt = promptText.trim()
    const normalizedText = trimmedPrompt || 'Voice prompt is empty.'
    const languageLabel = LANGUAGE_OPTIONS.find((option) => option.value === language)?.label || 'English'
    const titleSource = trimmedPrompt ? trimmedPrompt.replace(/\s+/g, ' ').trim() : 'Voice Prompt'
    const title = titleSource.length > 72 ? `${titleSource.slice(0, 69).trim()}...` : titleSource
    const cleanWords = Array.from(
      new Set(
        normalizedText
          .toLowerCase()
          .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
          .split(/\s+/)
          .map((word) => word.trim())
          .filter((word) => word.length > 2)
      )
    ).slice(0, 8)

    return {
      title: title || 'Voice Prompt',
      prompt: normalizedText,
      category: 'Voice Prompt',
      style: `${languageLabel} voice`,
      tags: ['voice', 'prompt', languageLabel.toLowerCase(), ...cleanWords],
      description: `Generated voice prompt in ${languageLabel.toLowerCase()} language for image creation.`,
    }
  }

  const handleSavePrompt = async () => {
    if (!user) {
      setSaveState({ status: 'error', message: 'Sign in to save this prompt to My Prompts.' })
      toast.error('Sign in to save this prompt to My Prompts.')
      return
    }

    const trimmedPrompt = promptText.trim()
    if (!trimmedPrompt) {
      setSaveState({ status: 'error', message: 'Add some prompt text before saving.' })
      toast.error('Add some prompt text before saving.')
      return
    }

    if (isSavingPrompt) {
      return
    }

    const payload = buildVoicePromptPayload()
    const signature = `${payload.title}|${payload.prompt}|${payload.category}|${payload.style}`

    if (lastSavedSignatureRef.current && lastSavedSignatureRef.current === signature) {
      setSaveState({ status: 'error', message: 'This prompt is already saved to My Prompts.' })
      toast.info('This prompt is already saved to My Prompts.')
      return
    }

    setIsSavingPrompt(true)
    setSaveState({ status: 'idle', message: '' })

    try {
      const result = await createUserPrompt(payload)
      lastSavedSignatureRef.current = signature
      setSavedPromptId(result?._id || null)
      setSaveState({ status: 'success', message: 'Prompt saved to My Prompts.' })
      toast.success('Prompt saved to My Prompts.')
      trackEvent('voice_prompt_save_prompt', {
        language,
        word_count: trimmedPrompt.split(/\s+/).length,
      })
    } catch (error) {
      const errorMessage = error?.message || 'Unable to save this prompt right now.'
      setSaveState({ status: 'error', message: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsSavingPrompt(false)
    }
  }

  const speechCopyLabel =
    speechCopyState === 'success' ? 'Copied!' : speechCopyState === 'error' ? 'Copy failed' : 'Copy Text'
  const hasPrompt = Boolean(promptText.trim())
  const wordCount = hasPrompt ? promptText.trim().split(/\s+/).length : 0

  return (
    <div className="mx-auto w-[min(var(--container-width),calc(100%-2rem))] py-8 pb-16 md:py-10">
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
                <Sparkles className="size-3.5" aria-hidden="true" />
                Speak · Listen · Create
              </div>

              <div className="space-y-3">
                <h1 className="m-0 text-[clamp(2.2rem,5vw,4.3rem)] leading-[0.95] tracking-[-0.07em] text-[var(--text)]">
                  Voice Prompt
                </h1>
                <p className="m-0 max-w-xl text-base leading-7 text-[var(--text-muted)] md:text-lg">
                  Speak your idea and turn it into a ready-to-use AI image prompt.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)] lg:self-center">
              <AudioLines className="size-3.5" aria-hidden="true" />
              Speech to Prompt
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut', delay: 0.06 }}
        className="mb-8 max-md:transform-none!"
      >
        <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Step 01
              </p>
              <h2 className="m-0 text-2xl font-semibold tracking-[-0.05em] text-[var(--text)] sm:text-3xl">
                Speak your prompt
              </h2>
            </div>

            {isListening ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[rgba(180,35,24,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--error)]">
                <span className="relative flex size-2 items-center justify-center" aria-hidden="true">
                  <span
                    className={`absolute inline-flex size-2 rounded-full bg-[var(--error)] ${
                      prefersReducedMotion ? '' : 'animate-ping'
                    }`}
                  />
                  <span className="relative inline-flex size-2 rounded-full bg-[var(--error)]" />
                </span>
                Listening
              </span>
            ) : (
              <Badge tone={hasPrompt ? 'brand' : 'neutral'}>{hasPrompt ? 'Text ready' : 'Idle'}</Badge>
            )}
          </div>

          <div className="mt-5 space-y-2">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Speech language
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Speech recognition language">
              {LANGUAGE_OPTIONS.map((option) => {
                const isActive = option.value === language

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLanguageChange(option.value)}
                    aria-pressed={isActive}
                    className={`min-h-[40px] rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                      isActive
                        ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 sm:py-8">
            <div className="relative flex items-center justify-center">
              {isListening && !prefersReducedMotion ? (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute size-[132px] rounded-full border border-[var(--error)]"
                  initial={{ opacity: 0.45, scale: 0.85 }}
                  animate={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              ) : null}

              <button
                type="button"
                onClick={handleToggleRecording}
                disabled={!speechRecognitionSupported}
                aria-pressed={isListening}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
                className={`relative inline-flex size-[104px] items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60 sm:size-[120px] ${
                  isListening
                    ? 'border-[var(--error)] bg-[var(--error)] text-[var(--background)] shadow-[0_18px_40px_rgba(180,35,24,0.22)]'
                    : 'border-[var(--border)] bg-[var(--brand)] text-[var(--background)] shadow-[0_18px_40px_rgba(15,23,42,0.16)] hover:-translate-y-0.5'
                }`}
              >
                {isListening ? (
                  <Square className="size-8" aria-hidden="true" />
                ) : (
                  <Mic className="size-10" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant={isListening ? 'secondary' : 'primary'}
                onClick={handleToggleRecording}
                disabled={!speechRecognitionSupported}
                className="inline-flex items-center gap-2"
                aria-label={isListening ? 'Stop recording speech' : 'Start recording speech'}
              >
                {isListening ? (
                  <Square className="size-3.5" aria-hidden="true" />
                ) : (
                  <Mic className="size-4" aria-hidden="true" />
                )}
                {isListening ? 'Stop Recording' : 'Start Recording'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={!hasPrompt && !isListening}
                className="inline-flex items-center gap-2"
                aria-label="Clear recognized speech text"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Clear
              </Button>
            </div>

            <p className="m-0 max-w-md text-center text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
              {isListening
                ? 'Listening… speak naturally. Your words appear below as you talk.'
                : speechRecognitionSupported
                  ? 'Tap the microphone, allow access, then speak your image idea out loud.'
                  : 'Your browser cannot listen, but you can still type your prompt below.'}
            </p>
          </div>

          {!speechRecognitionSupported ? (
            <div
              className="mt-5 flex items-start gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--text-muted)]"
              role="status"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--error)]" aria-hidden="true" />
              <p className="m-0">{UNSUPPORTED_MESSAGE}</p>
            </div>
          ) : null}

          {statusMessage ? (
            <div
              className="mt-5 flex items-start gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--text-muted)]"
              role="alert"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--error)]" aria-hidden="true" />
              <p className="m-0">{statusMessage}</p>
            </div>
          ) : null}

          <div className="mt-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="voice-prompt-transcript"
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]"
              >
                Recognized speech
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-[var(--text-muted)]">
                  {hasPrompt ? `${wordCount} ${wordCount === 1 ? 'word' : 'words'}` : 'No text yet'}
                </span>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleCopySpeechText}
                  disabled={!hasPrompt}
                  className={`inline-flex items-center gap-2 ${
                    speechCopyState === 'success'
                      ? 'border-[var(--success)] bg-[var(--success)] text-[var(--background)] hover:-translate-y-0'
                      : speechCopyState === 'error'
                        ? 'border-[var(--error)] text-[var(--error)]'
                        : ''
                  }`}
                  aria-live="polite"
                  aria-label={speechCopyLabel}
                >
                  {speechCopyState === 'success' ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" aria-hidden="true" />
                  )}
                  {speechCopyLabel}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleSavePrompt}
                  disabled={!hasPrompt || isSavingPrompt || !user}
                  className="inline-flex items-center gap-2"
                  aria-label={user ? 'Save this voice prompt to My Prompts' : 'Sign in to save this voice prompt'}
                >
                  {isSavingPrompt ? 'Saving...' : 'Save to My Prompts'}
                </Button>
              </div>
            </div>

            <textarea
              id="voice-prompt-transcript"
              value={promptText}
              onChange={handlePromptChange}
              rows={6}
              placeholder="Your spoken words will appear here. You can also type and edit them manually."
              className="w-full resize-y rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--focus)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:text-base"
            />

            {saveState.message ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
                <p
                  className={`text-sm ${saveState.status === 'success' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}
                  aria-live="polite"
                >
                  {saveState.message}
                </p>

                {saveState.status === 'success' && savedPromptId ? (
                  <Link to="/my-prompts" className="text-sm font-semibold text-[var(--brand)]">
                    View My Prompts
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut', delay: 0.12 }}
        className="max-md:transform-none!"
      >
        <div className="rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-muted)_100%)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[var(--text)]">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Ready to Create?
              </p>
              <Badge tone={hasPrompt ? 'success' : 'neutral'}>
                {hasPrompt ? 'Prompt ready' : 'Waiting for your voice'}
              </Badge>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {READY_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[9px] text-[var(--text)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{step}</span>
                  {index < READY_STEPS.length - 1 ? (
                    <span className="h-px w-3 bg-[var(--border)]" aria-hidden="true" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <a
                href="https://chatgpt.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => handleCreateWith('chatgpt', event)}
                aria-disabled={!hasPrompt}
                aria-label="Create with ChatGPT opens in a new tab"
                className={`group flex min-h-[52px] items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] px-4 py-3 text-left text-[var(--text)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                  hasPrompt
                    ? 'bg-[linear-gradient(180deg,rgba(113,79,246,0.08),rgba(255,255,255,0.02))] hover:-translate-y-0.5 hover:border-[var(--focus)]'
                    : 'cursor-not-allowed bg-[var(--surface)] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold">
                    Create with
                    <span className="mt-0.5 block text-base font-bold">ChatGPT</span>
                  </span>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>

              <a
                href="https://gemini.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => handleCreateWith('gemini', event)}
                aria-disabled={!hasPrompt}
                aria-label="Create with Gemini opens in a new tab"
                className={`group flex min-h-[52px] items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] px-4 py-3 text-left text-[var(--text)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                  hasPrompt
                    ? 'bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--focus)]'
                    : 'cursor-not-allowed bg-[var(--surface)] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold">
                    Create with
                    <span className="mt-0.5 block text-base font-bold">Gemini</span>
                  </span>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>

            <div className="mt-4">
              <p className="m-0 text-[11px] leading-5 text-[var(--text-muted)] sm:text-xs" aria-live="polite">
                {promptCopyState === 'success'
                  ? 'Prompt copied — paste it into the AI tool that just opened.'
                  : promptCopyState === 'error'
                    ? 'The prompt could not be copied automatically. Copy it from Step 01 manually.'
                    : 'Copy the prompt → Open an AI tool → Upload your photo → Paste the prompt → Generate'}
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default VoicePromptPage

