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
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import useDocumentMeta from '../hooks/useDocumentMeta'
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

function VoicePromptPage() {
  const prefersReducedMotion = useReducedMotion()
  const speechRecognitionSupported = useMemo(() => Boolean(getSpeechRecognition()), [])
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].value)
  const [promptText, setPromptText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [speechCopyState, setSpeechCopyState] = useState('idle')
  const [promptCopyState, setPromptCopyState] = useState('idle')

  const recognitionRef = useRef(null)
  const keepListeningRef = useRef(false)
  const committedTextRef = useRef('')
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current
      keepListeningRef.current = false
      recognitionRef.current = null

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

    // Changing language restarts the session, so the previous instance is dropped first.
    if (recognitionRef.current) {
      keepListeningRef.current = false
      try {
        recognitionRef.current.abort()
      } catch {
        // Ignore abort failures and continue with the new session.
      }
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = nextLanguage
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    committedTextRef.current = promptText.trim() ? `${promptText.trim()} ` : ''
    finalTranscriptRef.current = ''

    recognition.onstart = () => {
      setIsListening(true)
      setStatusMessage('')
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = result[0]?.transcript ?? ''

        if (result.isFinal) {
          finalTranscriptRef.current += `${transcript} `
        } else {
          interimTranscript += transcript
        }
      }

      setPromptText(`${committedTextRef.current}${finalTranscriptRef.current}${interimTranscript}`)
      setSpeechCopyState('idle')
      setPromptCopyState('idle')
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Benign: the session simply continues or restarts on the next result.
        return
      }

      keepListeningRef.current = false
      setIsListening(false)
      setStatusMessage(describeSpeechError(event.error))
    }

    recognition.onend = () => {
      // Browsers end long continuous sessions on their own; keep the mic alive until the user stops.
      if (keepListeningRef.current) {
        try {
          recognition.start()
          return
        } catch {
          keepListeningRef.current = false
        }
      }

      setIsListening(false)
    }

    recognitionRef.current = recognition
    keepListeningRef.current = true

    try {
      recognition.start()
    } catch {
      keepListeningRef.current = false
      setIsListening(false)
      setStatusMessage('The microphone could not start. Please try again.')
    }
  }

  const stopListening = () => {
    keepListeningRef.current = false
    const recognition = recognitionRef.current

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
    finalTranscriptRef.current = ''
  }

  const handleClear = () => {
    stopListening()
    committedTextRef.current = ''
    finalTranscriptRef.current = ''
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
      trackEvent('voice_prompt_copy_transcript', { language })
      window.setTimeout(() => setSpeechCopyState('idle'), 1600)
    } catch {
      setSpeechCopyState('error')
      window.setTimeout(() => setSpeechCopyState('idle'), 1800)
    }
  }

  const copyPromptForAiTool = () => {
    // Copy first, then the card's own href opens the AI tool in a new tab.
    writeToClipboard(promptText)
      .then(() => {
        setPromptCopyState('success')
        window.setTimeout(() => setPromptCopyState('idle'), 2600)
      })
      .catch(() => {
        setPromptCopyState('error')
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

              <div className="flex items-center gap-2">
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

